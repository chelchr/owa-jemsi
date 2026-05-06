"use client";

import { BookOpen, Siren } from "lucide-react";
import { useReportModal } from "./report-context";
import Image from "next/image";

export function Hero() {
  const { openModal } = useReportModal();

  return (
    <section className="relative bg-leaf-200 overflow-hidden">
      <div className="mx-auto max-w-md px-6 pt-28 pb-80 text-center">
        <div className="mx-auto w-24 h-24 grid place-items-center rounded-2xl text-leaf-100 mb-6 relative">
          <Image src="/icon-park-solid_report.svg" alt="Owa Jemsi" width={140} height={140} />
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-forest-900">
          Lindungi Satwa.
          <br />
          <span className="text-orange-brand">Lapor Cepat.</span>
          <br />
          Selamatkan Habitat.
        </h1>

        <p className="mt-5 text-forest-800/80 text-sm leading-relaxed">
          Tanpa login, tanpa ribet. Cukup ambil foto dan kirim lokasi presisi
          dalam hitungan detik.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={openModal}
            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-orange-brand hover:bg-orange-brand-dark transition-colors text-white font-bold tracking-wide shadow-md"
          >
            <Siren className="w-5 h-5" />
            LAPOR SEKARANG!
          </button>
          <a
            href="#panduan"
            className="flex items-center justify-center gap-2 w-full h-14 rounded-xl border border-forest-200 bg-leaf-100/60 text-forest-800 font-semibold"
          >
            <BookOpen className="w-5 h-5" />
            Lihat Panduan Keselamatan
          </a>
        </div>
      </div>

      {/* Hill silhouette + animal placeholder */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none">
        <svg
          viewBox="0 0 400 160"
          className="w-full h-44 text-leaf-300"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120 Q 80 60 160 110 T 320 95 T 400 110 L 400 160 L 0 160 Z"
            fill="currentColor"
          />
          <path
            d="M0 140 Q 100 90 200 130 T 400 130 L 400 160 L 0 160 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 h-48 w-[calc(100%+3.5rem)] max-w-[32rem] -translate-x-1/2">
          <Image
            src="/OWA1%201.svg"
            alt="Owa"
            width={320}
            height={320}
            className="absolute bottom-1 left-[-1.75rem] h-auto w-56 max-w-none sm:left-[-1rem] sm:w-60"
            priority
          />
          <Image
            src="/Enggang1-1%201.svg"
            alt="Enggang"
            width={320}
            height={320}
            className="absolute bottom-5 right-[-1.5rem] h-auto w-52 max-w-none sm:right-[-0.75rem] sm:w-56"
            priority
          />
        </div>
      </div>
    </section>
  );
}
