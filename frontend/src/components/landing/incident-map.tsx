import { AlertTriangle, MapPin } from "lucide-react";
import Image from "next/image";
const LEGEND = [
  { label: "Beruang", color: "bg-yellow-400" },
  { label: "Enggang", color: "bg-green-500" },
  { label: "Orangutan", color: "bg-orange-brand" },
  { label: "Lainnya", color: "bg-amber-700" },
];

const STATS = [
  { label: "BERUANG", value: "20", color: "bg-danger-500" },
  { label: "ENGGANG", value: "47", color: "bg-orange-brand" },
  { label: "ORANGUTAN", value: "35", color: "bg-amber-500" },
];

export function IncidentMap() {
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
          <span className="font-bold text-forest-900">109 insiden</span>{" "}
          perjumpaan satwa dan jalur jelajah endemik selama satu dekade
          terakhir. Pahami ruang gerak mereka untuk harmoni pembangunan yang
          lebih baik.
        </p>

        <Image src="/Frame 5.svg" alt="Peta Interaksi Satwa IKN" width={800} height={400} className="rounded-2xl border border-leaf-100" />


        <div className="mt-4 rounded-2xl bg-forest-700 text-white p-4">
          <p className="text-[11px] tracking-wider opacity-80">TOTAL INSIDEN</p>
          <p className="mt-1 text-3xl font-extrabold">
            109{" "}
            <span className="text-xs font-medium opacity-80">
              selama satu dekade terakhir
              <br />
              untuk semua spesies
            </span>
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl ${s.color} text-white p-3`}
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
