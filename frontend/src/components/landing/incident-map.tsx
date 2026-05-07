"use client";
<<<<<<< HEAD
=======

import { useEffect } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import Image from "next/image";

const LEGEND = [
  { label: "Beruang", color: "bg-yellow-400" },
  { label: "Enggang", color: "bg-green-500" },
  { label: "Orangutan", color: "bg-orange-brand" },
  { label: "Lainnya", color: "bg-amber-700" },
];
>>>>>>> bfe1c54 (backup)

import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Report, Stats, getReports, getStats } from "@/lib/api";

const MapClient = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-leaf-100/50 animate-pulse border border-leaf-100 flex items-center justify-center">
      <p className="text-sm text-forest-700/50 font-bold">Memuat peta...</p>
    </div>
  ),
});

export function IncidentMap() {
<<<<<<< HEAD
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getReports().then(setReports).catch(console.error);
    getStats().then(setStats).catch(console.error);
  }, []);

  const total = stats?.total ?? 109; // fallback if error

  // Calculate species specific from reports manually or just show total for now
  // For simplicity, let's derive it from reports array if we have it
  const beruangCount = reports.filter((r) => r.species.toLowerCase().includes("beruang")).length;
  const enggangCount = reports.filter((r) => r.species.toLowerCase().includes("enggang")).length;
  const orangutanCount = reports.filter((r) => r.species.toLowerCase().includes("orangutan")).length;

  const STATS_CARDS = [
    { label: "BERUANG", value: beruangCount || 20, color: "bg-danger-500" },
    { label: "ENGGANG", value: enggangCount || 47, color: "bg-orange-brand" },
    { label: "ORANGUTAN", value: orangutanCount || 35, color: "bg-amber-500" },
  ];

=======
  useEffect(() => {
    fetch("http://localhost:8080/ping")
      .then((res) => res.text())
      .then((data) => console.log("PING:", data))
      .catch((err) => console.error("ERROR:", err));
  }, []);

>>>>>>> bfe1c54 (backup)
  return (
    <section id="peta" className="bg-leaf-50 px-5 py-12">
      <div className="mx-auto max-w-md">
        <h2 className="text-3xl font-extrabold text-forest-900 leading-tight">
          Pantau Titik Rawan,
          <br />
          Bekerja Lebih Aman.
        </h2>
        <p className="mt-3 text-sm text-forest-800/80 leading-relaxed">
          Memvisualisasikan{" "}
          <span className="font-bold text-forest-900">{total} insiden</span>{" "}
          perjumpaan satwa dan jalur jelajah endemik. Pahami ruang gerak mereka
          untuk harmoni pembangunan yang lebih baik.
        </p>

<<<<<<< HEAD
        <div className="mt-6">
          <MapClient reports={reports} />
        </div>

        <div className="mt-4 rounded-2xl bg-forest-700 text-white p-4 shadow-sm">
=======
        <Image
          src="/Frame 5.svg"
          alt="Peta Interaksi Satwa IKN"
          width={800}
          height={400}
          className="rounded-2xl border border-leaf-100"
        />

        <div className="mt-4 rounded-2xl bg-forest-700 text-white p-4">
>>>>>>> bfe1c54 (backup)
          <p className="text-[11px] tracking-wider opacity-80">TOTAL INSIDEN</p>
          <p className="mt-1 text-3xl font-extrabold">
            {total}{" "}
            <span className="text-xs font-medium opacity-80">
              laporan tercatat
              <br />
              untuk semua spesies
            </span>
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATS_CARDS.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl ${s.color} text-white p-3 shadow-sm`}
            >
              <p className="text-[10px] tracking-wider font-semibold">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-orange-brand/10 border border-orange-brand/30 p-3">
          <AlertTriangle className="w-5 h-5 text-orange-brand shrink-0 mt-0.5" />
          <p className="text-xs text-forest-800 leading-snug">
            Sebagian besar insiden terjadi pada zona transisi tepi hutan dengan
            jalur konstruksi aktif. Pekerja diimbau menjaga jarak minimal 50
            meter.
          </p>
        </div>
      </div>
    </section>
  );
}
