"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, RotateCcw, Save } from "lucide-react";

type Position = { latitude: number; longitude: number };

export default function CameraCapture() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const mode = searchParams.get("mode") === "checkout" ? "checkout" : "checkin";

  useEffect(() => {
    let cameraStream: MediaStream | undefined;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((nextStream) => { cameraStream = nextStream; setStream(nextStream); if (videoRef.current) videoRef.current.srcObject = nextStream; })
      .catch(() => setError("Unable to open the camera. Allow camera access and try again."));
    return () => cameraStream?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function takePhoto() {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) { setImage(blob); setPreviewUrl(URL.createObjectURL(blob)); stream?.getTracks().forEach((track) => track.stop()); } }, "image/jpeg", 0.8);
  }

  async function submit() {
    const storedPosition = sessionStorage.getItem("checkin_position");
    const storedOrigin = sessionStorage.getItem("checkin_origin");
    if (!image || !storedPosition) { setError("A photo and location are required for timekeeping."); return; }
    setIsSaving(true); setError("");
    const form = new FormData();
    form.append("photo", new File([image], "attendance-photo.jpg", { type: "image/jpeg" }));
    form.append("mode", mode); form.append("coordinates", storedPosition); form.append("note", note);
    if (storedOrigin) form.append("origin", storedOrigin);
    try {
      const response = await fetch("/api/checkin/submit", { method: "POST", body: form });
      const result = await response.json() as { message?: string };
      if (!response.ok) { setError("Timekeeping could not be completed."); return; }
      sessionStorage.removeItem("checkin_position"); sessionStorage.removeItem("checkin_origin"); router.replace("/dashboard"); router.refresh();
    } catch { setError("Unable to connect to the server. Please try again."); } finally { setIsSaving(false); }
  }

  return <main className="min-h-dvh bg-[#f8f8ff] px-4 py-5"><section className="mx-auto max-w-[430px]"><button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold text-brand"><ArrowLeft size={16} aria-hidden="true" />Back</button><h1 className="mt-4 text-xl font-bold">{image ? "Review your photo" : "Take photo"}</h1><div className="relative mt-4 aspect-[.82] overflow-hidden rounded-[1.75rem] bg-zinc-900">{image ? <Image src={previewUrl} alt="Attendance preview" fill unoptimized className="object-cover" /> : <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />}</div><canvas ref={canvasRef} className="hidden" />{error ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}{image ? <><label className="mt-4 block text-sm font-medium">Note</label><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={250} rows={3} className="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 outline-none focus:border-brand" /><div className="mt-4 flex gap-3"><button onClick={() => { setImage(null); window.location.reload(); }} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-brand font-semibold text-brand"><RotateCcw size={18} aria-hidden="true" />Retake</button><button onClick={submit} disabled={isSaving} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white disabled:opacity-60"><Save size={18} aria-hidden="true" />{isSaving ? "Saving…" : "Save Photo"}</button></div></> : <button onClick={takePhoto} disabled={!stream} className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand font-bold text-white disabled:opacity-60"><Camera size={20} aria-hidden="true" />Take photo</button>}</section></main>;
}
