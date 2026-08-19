"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";

export interface PhotoDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Molecule `PhotoDropzone` (seleção de arquivo + preview) — envio de foto no
 * convite pessoal. Cobre o estado de "permissão negada" quando o convidado
 * tenta usar a câmera ao vivo (ver docs/design-system/matriz-estados.md).
 *
 * A validação real de tipo/tamanho de arquivo acontece no servidor
 * (lib/file-validation.ts); aqui só damos feedback imediato de UX.
 */
export function PhotoDropzone({ value, onChange, error, disabled }: PhotoDropzoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  }

  async function openCamera() {
    setCameraError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Esse navegador não permite abrir a câmera aqui. Escolhe a foto da sua galeria.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (caughtError) {
      const name = caughtError instanceof DOMException ? caughtError.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError(
          "Precisamos da sua permissão para abrir a câmera. Libera o acesso à câmera nas configurações do navegador e tenta de novo — ou escolhe uma foto já salva.",
        );
      } else {
        setCameraError("Não conseguimos abrir a câmera agora. Escolhe uma foto já salva na galeria.");
      }
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });
      onChange(file);
      closeCamera();
    }, "image/jpeg");
  }

  return (
    <div className="flex flex-col gap-field-gap">
      {isCameraOpen ? (
        <div className="flex flex-col gap-field-gap">
          <video ref={videoRef} className="w-full rounded-control bg-ink-900" muted playsInline />
          <div className="flex gap-field-gap">
            <Button type="button" onClick={capturePhoto} disabled={disabled}>
              Capturar foto
            </Button>
            <Button type="button" variant="secondary" onClick={closeCamera} disabled={disabled}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-field-gap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled}
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
            <Icon name="camera" size={18} /> Escolher foto
          </Button>
          <Button type="button" variant="secondary" onClick={openCamera} disabled={disabled}>
            Usar câmera
          </Button>
          {value ? (
            <Button type="button" variant="secondary" onClick={() => onChange(null)} disabled={disabled}>
              Remover
            </Button>
          ) : null}
        </div>
      )}

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Pré-visualização da foto escolhida"
          className="h-40 w-40 rounded-control border border-border-subtle object-cover"
        />
      ) : null}

      {cameraError ? (
        <Text tone="error" role="alert" className="text-100">
          {cameraError}
        </Text>
      ) : null}
      {error ? (
        <Text tone="error" role="alert" className="text-100">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
