"use client";

import { Camera, MapPin, RefreshCw, Send, Siren, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useReportModal } from "./report-context";

const ANIMALS = ["Orangutan", "Enggang", "Beruang Madu", "Lainnya"] as const;

export function ReportModal() {
  const { open, closeModal } = useReportModal();
  const [selected, setSelected] = useState<(typeof ANIMALS)[number]>("Lainnya");
  const [note, setNote] = useState("");

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
          <div>
            <SectionLabel n={1}>INFORMASI SATWA</SectionLabel>

            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-leaf-100 border border-dashed border-forest-200 py-7 grid place-items-center"
            >
              <span className="grid place-items-center w-12 h-12 rounded-full bg-orange-brand/15 text-orange-brand mb-2">
                <Camera className="w-6 h-6" />
              </span>
              <span className="font-bold text-forest-800">Buka Kamera</span>
              <span className="text-xs text-forest-700/70 mt-1">
                Ketuk untuk mengambil foto langsung
              </span>
            </button>

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

          <div>
            <SectionLabel n={2}>LOKASI OTOMATIS</SectionLabel>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-forest-100 bg-white p-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-forest-700 text-white shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <div className="flex-1 leading-tight">
                <p className="font-semibold text-forest-900">
                  -7.76745, 110.37657
                </p>
                <p className="text-xs text-forest-700/70">
                  Akurasi ±56m · siap dikirim
                </p>
              </div>
              <button
                type="button"
                aria-label="Segarkan lokasi"
                className="p-2 rounded-lg hover:bg-leaf-50"
              >
                <RefreshCw className="w-4 h-4 text-forest-700" />
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-leaf-100 px-5 py-4 flex items-center gap-3 bg-white">
          <p className="text-[11px] text-forest-700/70 leading-snug flex-1">
            Dengan mengirim, Anda setuju lokasi & foto dibagikan ke tim
            responder HERU.
          </p>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-sm font-bold shrink-0"
          >
            <Send className="w-4 h-4" />
            Kirim Laporan
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
