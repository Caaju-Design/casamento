/**
 * Sequência de quadros do hero em aquarela (extraídos do BANNERHERO.mp4).
 *
 * POR QUE NÃO USAR MAIS <video> COM SEEK:
 * O hero antigo "puxava" o `currentTime` de um <video> pelo scroll. No
 * celular isso quebrava de um jeito que nenhum ajuste fino resolveu: o
 * navegador mobile só baixa uma parte do vídeo (ignora `preload="auto"` pra
 * economizar dados), e cada seek obriga o decoder a buscar/decodificar de
 * novo a partir do keyframe mais próximo. Resultado relatado pelo casal: a
 * pessoa rolava, o vídeo ficava congelado durante toda a rolagem do hero e
 * só "acordava" quando o conteúdo já estava aparecendo.
 *
 * A solução aqui é a mesma técnica das páginas de produto da Apple:
 *  1. Cada quadro é uma imagem WebP pequena (12 quadros por segundo do vídeo).
 *  2. Todos são BAIXADOS como Blob (comprimido, pouca memória) ANTES da
 *     rolagem ser liberada, com barra de progresso de verdade (preloader).
 *  3. Só os quadros perto da posição atual são DECODIFICADOS
 *     (`createImageBitmap`, fora da thread principal); os distantes são
 *     liberados. Assim a memória não explode no celular.
 *  4. Se um quadro ainda não estiver pronto, usa o mais próximo que estiver.
 *     Nunca existe "vídeo travado esperando o decoder".
 */

export type FrameSet = {
  /** Pasta pública dos quadros, ex.: "/hero/aquarela/m". */
  base: string;
  count: number;
};

export const FRAME_SETS = {
  desktop: { base: "/hero/aquarela/d", count: 121 } satisfies FrameSet,
  mobile: { base: "/hero/aquarela/m", count: 121 } satisfies FrameSet,
};

export type FrameSource = ImageBitmap | HTMLImageElement;

const FETCH_CONCURRENCY = 6;
/** Janela de quadros decodificados ao redor da posição atual. */
const DECODE_RADIUS = 6;
/**
 * A cada quantos quadros fica um "quadro-âncora" sempre decodificado. Se a
 * pessoa pula longe (link de âncora, rolagem muito rápida), o quadro exibido
 * nunca fica mais de meio intervalo longe do certo enquanto a janela nova
 * decodifica — em vez de mostrar um quadro lá do outro lado da sequência.
 */
const PIN_EVERY = 10;

function frameUrl(set: FrameSet, i: number) {
  return `${set.base}/${String(i).padStart(3, "0")}.webp`;
}

/**
 * Ordem de download "em peneira": primeiro, último, meio, quartos, oitavos…
 * Com isso, mesmo baixando só uma parte, a sequência inteira já fica coberta
 * de ponta a ponta (com quadros mais espaçados), nunca só o começo.
 */
function sieveOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen.has(i)) {
      seen.add(i);
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  for (let step = 64; step >= 1; step = Math.floor(step / 2)) {
    for (let i = 0; i < count; i += step) push(i);
  }
  return order;
}

export class FrameStore {
  readonly set: FrameSet;
  private blobs: (Blob | null)[];
  private decoded = new Map<number, FrameSource>();
  private decoding = new Map<number, Promise<void>>();
  private aborted = false;
  private loadedCount = 0;

  constructor(set: FrameSet) {
    this.set = set;
    this.blobs = new Array(set.count).fill(null);
  }

  get count() {
    return this.set.count;
  }

  get loaded() {
    return this.loadedCount;
  }

  private isPinned(i: number) {
    return i % PIN_EVERY === 0 || i === this.set.count - 1;
  }

  /** Decodifica os quadros-âncora, um de cada vez (sem disputar a thread com a rolagem). */
  async decodePinned(onDecoded: () => void) {
    for (let i = 0; i < this.set.count && !this.aborted; i++) {
      if (this.isPinned(i)) await this.decode(i, onDecoded);
    }
  }

  isLoaded(i: number) {
    return this.blobs[i] !== null;
  }

  /**
   * Baixa todos os quadros. `onProgress` recebe 0→1. A promessa só resolve
   * quando TODOS terminaram (ou falharam); quem chama decide quando liberar
   * a rolagem (ver `readyFraction`).
   */
  async loadAll(onProgress: (fraction: number) => void): Promise<void> {
    const queue = sieveOrder(this.set.count);
    let cursor = 0;
    const worker = async () => {
      while (!this.aborted && cursor < queue.length) {
        const i = queue[cursor++];
        if (i === undefined) break;
        for (let attempt = 0; attempt < 3 && !this.aborted; attempt++) {
          try {
            const res = await fetch(frameUrl(this.set, i), { cache: "force-cache" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            if (this.aborted) return;
            this.blobs[i] = blob;
            this.loadedCount++;
            onProgress(this.loadedCount / this.set.count);
            break;
          } catch {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          }
        }
      }
    };
    await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));
  }

  /** Índice baixado mais próximo de `i` (ou -1 se nada foi baixado ainda). */
  nearestLoaded(i: number): number {
    const n = this.set.count;
    for (let d = 0; d < n; d++) {
      if (i - d >= 0 && this.blobs[i - d]) return i - d;
      if (i + d < n && this.blobs[i + d]) return i + d;
    }
    return -1;
  }

  /** Quadro decodificado mais próximo de `i` (pode não ser exatamente `i`). */
  nearestDecoded(i: number): { index: number; source: FrameSource } | null {
    const n = this.set.count;
    for (let d = 0; d < n; d++) {
      const a = this.decoded.get(i - d);
      if (a) return { index: i - d, source: a };
      const b = this.decoded.get(i + d);
      if (b) return { index: i + d, source: b };
    }
    return null;
  }

  /**
   * Garante que os quadros ao redor de `center` estejam decodificados e
   * libera os que ficaram longe. Chame sempre que a posição mudar.
   * `onDecoded` avisa quando um quadro novo fica pronto (pra redesenhar).
   */
  ensureWindow(center: number, onDecoded: () => void, keep: number[] = []) {
    const lo = Math.max(0, center - DECODE_RADIUS);
    const hi = Math.min(this.set.count - 1, center + DECODE_RADIUS);
    // decodifica do centro pra fora
    for (let d = 0; d <= DECODE_RADIUS; d++) {
      for (const i of d === 0 ? [center] : [center + d, center - d]) {
        if (i < lo || i > hi) continue;
        this.decode(i, onDecoded);
      }
    }
    for (const [i, src] of this.decoded) {
      if ((i < lo - 2 || i > hi + 2) && !keep.includes(i) && !this.isPinned(i)) {
        releaseSource(src);
        this.decoded.delete(i);
      }
    }
  }

  decode(i: number, onDecoded?: () => void): Promise<void> {
    if (this.decoded.has(i)) return Promise.resolve();
    const inFlight = this.decoding.get(i);
    if (inFlight) return inFlight;
    const blob = this.blobs[i];
    if (!blob) return Promise.resolve();
    const p = decodeBlob(blob)
      .then((src) => {
        if (this.aborted) return;
        this.decoded.set(i, src);
        onDecoded?.();
      })
      .catch(() => undefined)
      .finally(() => this.decoding.delete(i));
    this.decoding.set(i, p);
    return p;
  }

  dispose() {
    this.aborted = true;
    for (const src of this.decoded.values()) releaseSource(src);
    this.decoded.clear();
    this.blobs = [];
  }
}

async function decodeBlob(blob: Blob): Promise<FrameSource> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Safari antigo: cai pro <img> abaixo
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img; // a URL do blob é liberada em releaseSource()
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/** Libera a memória de um quadro decodificado (bitmap ou <img> de blob). */
function releaseSource(src: FrameSource) {
  if ("close" in src && typeof src.close === "function") {
    src.close();
  } else if (src instanceof HTMLImageElement && src.src.startsWith("blob:")) {
    URL.revokeObjectURL(src.src);
  }
}
