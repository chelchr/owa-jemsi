"use client";

import { Camera, ImageIcon, Loader2, MapPin, RefreshCw, Send, Siren, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { submitReport } from "@/lib/api";
import { useGeolocation } from "@/lib/use-geolocation";
import { toast } from "@/components/ui/toast";
import { useReportModal } from "./report-context";

const ANIMALS = ["Orangutan", "Enggang", "Beruang Madu", "Lainnya"] as const;

export function ReportModal() {
  const { open, closeModal } = useReportModal();
  const [selected, setSelected] = useState<(typeof ANIMALS)[number]>("Lainnya");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const {
    latitude,
    longitude,
    accuracy,
    loading: geoLoading,
    error: geoError,
    refresh: refreshGeo,
  } = useGeolocation();

  // Cleanup preview URL on unmount or photo change
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeModal]);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!photo) {
      toast.error("Silakan ambil atau pilih foto terlebih dahulu.");
      return;
    }
    if (latitude === null || longitude === null) {
      toast.error("Lokasi belum tersedia. Izinkan akses lokasi di browser.");
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        photo,
        species: selected,
        description: note,
        latitude,
        longitude,
      });
      toast.success("Laporan berhasil dikirim! Terima kasih.");
      // Reset form
      setPhoto(null);
      setPreview("");
      setNote("");
      setSelected("Lainnya");
      closeModal();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengirim laporan. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const geoReady = latitude !== null && longitude !== null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Tutup"
        onClick={closeModal}
        className="absolute inset-0 bg-forest-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-t-3xl bg-orange-brand px-5 py-4 text-white">
          <span className="grid place-items-center w-10 h-10 rounded-lg bg-white/15">
            <Siren className="w-5 h-5" />
          </span>
          <div className="leading-tight flex-1">
            <p id="report-title" className="font-bold">
              HERU | Owa Jemsi
            </p>
            <p className="text-xs opacity-90">Help Response Unit</p>
          </div>
          <button
            type="button"
            aria-label="Tutup laporan"
            onClick={closeModal}
            className="grid place-items-center w-9 h-9 rounded-lg hover:bg-white/15 active:bg-white/25"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* ── Section 1: Informasi Satwa ── */}
          <div>
            <SectionLabel n={1}>INFORMASI SATWA</SectionLabel>

            {/* Hidden file inputs */}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />

            {/* Photo area */}
            {preview ? (
              <div className="mt-3 relative rounded-2xl overflow-hidden border border-forest-200">
                <img
                  src={preview}
                  alt="Preview foto"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="rounded-2xl bg-leaf-100 border border-dashed border-forest-200 py-6 grid place-items-center hover:bg-leaf-200 transition-colors"
                >
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-orange-brand/15 text-orange-brand mb-1.5">
                    <Camera className="w-5 h-5" />
                  </span>
                  <span className="font-bold text-forest-800 text-sm">Buka Kamera</span>
                  <span className="text-[10px] text-forest-700/70 mt-0.5">
                    Ambil foto langsung
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="rounded-2xl bg-leaf-100 border border-dashed border-forest-200 py-6 grid place-items-center hover:bg-leaf-200 transition-colors"
                >
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-forest-700/15 text-forest-700 mb-1.5">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span className="font-bold text-forest-800 text-sm">Pilih Galeri</span>
                  <span className="text-[10px] text-forest-700/70 mt-0.5">
                    Dari galeri foto
                  </span>
                </button>
              </div>
            )}

            {/* Species */}
            <p className="text-[11px] font-bold tracking-wider text-forest-700 mt-5">
              JENIS SATWA
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ANIMALS.map((a) => {
                const active = a === selected;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSelected(a)}
                    className={
                      "px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors " +
                      (active
                        ? "bg-forest-700 text-white border-forest-700"
                        : "bg-white text-forest-800 border-forest-200 hover:bg-leaf-50")
                    }
                  >
                    {a}
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <p className="text-[11px] font-bold tracking-wider text-forest-700 mt-5">
              CATATAN CEPAT (OPSIONAL)
            </p>
            <div className="relative mt-2">
              <textarea
                rows={3}
                maxLength={240}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: 1 ekor dewasa di tepi jalan tol KM 67, terlihat tenang."
                className="w-full rounded-xl border border-forest-100 bg-leaf-50/50 p-3 text-sm text-forest-900 placeholder:text-forest-700/40 focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
              <span className="absolute right-3 bottom-2 text-[11px] text-forest-700/60">
                {note.length}/240
              </span>
            </div>
          </div>

          {/* ── Section 2: Lokasi Otomatis ── */}
          <div>
            <SectionLabel n={2}>LOKASI OTOMATIS</SectionLabel>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-3">
              <span
                className={
                  "grid place-items-center w-10 h-10 rounded-full shrink-0 " +
                  (geoReady
                    ? "bg-forest-700 text-white"
                    : geoError
                    ? "bg-danger-500 text-white"
                    : "bg-forest-200 text-forest-700")
                }
              >
                {geoLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </span>
              <div className="flex-1 leading-tight">
                {geoLoading ? (
                  <>
                    <p className="font-semibold text-forest-900">
                      Mencari lokasi...
                    </p>
                    <p className="text-xs text-forest-700/70">
                      Izinkan akses lokasi di browser
                    </p>
                  </>
                ) : geoError ? (
                  <>
                    <p className="font-semibold text-danger-500 text-sm">
                      {geoError}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-forest-900">
                      {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
                    </p>
                    <p className="text-xs text-forest-700/70">
                      Akurasi ±{accuracy}m · siap dikirim
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label="Segarkan lokasi"
                onClick={refreshGeo}
                disabled={geoLoading}
                className="p-2 rounded-lg hover:bg-leaf-50 disabled:opacity-40"
              >
                <RefreshCw
                  className={
                    "w-4 h-4 text-forest-700 " +
                    (geoLoading ? "animate-spin" : "")
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-leaf-100 px-5 py-4 flex items-center gap-3 bg-white">
          <p className="text-[11px] text-forest-700/70 leading-snug flex-1">
            Dengan mengirim, Anda setuju lokasi &amp; foto dibagikan ke tim
            responder HERU.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold shrink-0 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center w-8 h-8 rounded-full bg-forest-700 text-white text-sm font-bold">
        {n}
      </span>
      <span className="font-extrabold text-forest-900 tracking-wide">
        {children}
      </span>
    </div>
  );
}
