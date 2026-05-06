"use client";

import { useEffect, useState } from "react";
import { Stats, getStats } from "@/lib/api";

const YEARLY = [
  { y: "2020", v: 12 },
  { y: "2021", v: 18 },
  { y: "2022", v: 24 },
  { y: "2023", v: 22 },
  { y: "2024", v: 17 },
  { y: "2025", v: 14 },
];

export function Trends() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  const total = stats?.total ?? 109; // fallback if error
  const tinggi = stats?.tinggi ?? 0;
  const sedang = stats?.sedang ?? 0;
  const rendah = stats?.rendah ?? 0;

  const SUMMARY = [
    { label: "TOTAL INSIDEN", value: total.toString(), sub: "Seluruh data" },
    { label: "RESIKO TINGGI", value: tinggi.toString(), sub: "Butuh penanganan" },
    { label: "RESIKO SEDANG", value: sedang.toString(), sub: "Pantauan aktif" },
    { label: "RESIKO RENDAH", value: rendah.toString(), sub: "Aman terkendali" },
  ];

  return (
    <section id="statistik" className="bg-leaf-50 px-5 py-12">
      <div className="mx-auto max-w-md">
        <h2 className="text-3xl font-extrabold text-forest-900 leading-tight">
          Tren: Data Interaksi
          <br />
          Satwa IKN
        </h2>
        <p className="mt-3 text-sm text-forest-800/80 leading-relaxed">
          Lihat seberapa sering &lsquo;tetangga rimba&rsquo; kita terlihat di
          berbagai sudut IKN. Setiap angka membantu kami menjaga keselamatan
          mereka dan juga Anda.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {SUMMARY.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white border border-leaf-100 p-4"
            >
              <p className="text-[10px] tracking-wider text-forest-700/70 font-semibold">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-forest-900">
                {s.value}
              </p>
              <p className="text-[11px] text-forest-700/70 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-leaf-100 p-4">
          <img src="/Gemini_Generated_Image_dfbvbcdfbvbcdfbv 1.png" alt="Line Chart" width={400} height={200} />
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-leaf-100 p-4">
          <img src="/Gemini_Generated_Image_29jvfj29jvfj29jv 1.png" alt="Bar Chart" width={400} height={200} />
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
