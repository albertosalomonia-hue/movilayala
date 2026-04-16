"use client";

import { useRef, useState, useCallback } from "react";

interface ImageCaptureProps {
  label: string;
  value: string | null;
  onChange: (base64: string | null) => void;
}

export default function ImageCapture({ label, value, onChange }: ImageCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [preview, setPreview] = useState<string | null>(value);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Abre la cámara usando getUserMedia (funciona en WebView de Android y TWA)
  const openCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Asignar stream al video después de que el DOM se actualice
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      // Si getUserMedia falla, usar input file con capture
      setCameraError(true);
      fileRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(base64);
    onChange(base64);
    stopCamera();
  }, [onChange, stopCamera]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Vista de cámara activa
  if (cameraOpen) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative rounded-xl overflow-hidden bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl"
            style={{ maxHeight: "60vh" }}
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
            <button
              type="button"
              onClick={stopCamera}
              className="bg-white/80 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-lg"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg border-4 border-blue-500"
            >
              📷
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="w-full h-48 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Botón cámara: usa getUserMedia, más compatible con APK */}
          <button
            type="button"
            onClick={openCamera}
            className="flex-1 h-36 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-2 text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium">Tomar foto</span>
          </button>

          {/* Botón galería: input file sin capture para elegir desde galería */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-3xl">🖼️</span>
            <span className="text-sm font-medium">Galería</span>
          </button>
        </div>
      )}

      {/* input para galería (sin capture para no forzar cámara) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* input oculto con capture como fallback si getUserMedia falla */}
      {cameraError && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={(el) => { if (el) el.click(); }}
          onChange={handleFile}
        />
      )}
    </div>
  );
}
