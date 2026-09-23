/**
 * Fração da rolagem do hero em que a pintura fica completa e a camada do
 * hero começa a dissolver pro conteúdo. Vem do hero antigo em vídeo: aos
 * 6.8s de 10.04s o casal já está na pose do beijo e segura até o fim.
 *
 * Arquivo separado (sem three.js) pra HeroSection importar sem puxar o
 * motor WebGL pro bundle inicial — o motor continua carregado sob demanda.
 */
export const PAINT_COMPLETE_AT = 6.8 / 10.04;
