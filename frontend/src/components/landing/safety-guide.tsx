import {
  Camera,
  Check,
  Eye,
  Footprints,
  Hand,
  Megaphone,
  PhoneCall,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const DO_ITEMS = [
  {
    icon: Footprints,
    title: "Mundur Perlahan",
    desc: "Mundur tanpa membalikkan badan. Beri ruang minimal 50 meter.",
  },
  {
    icon: Eye,
    title: "Tetap Tenang",
    desc: "Tatap singkat, lalu palingkan pandangan. Hindari kontak mata berlebih.",
  },
  {
    icon: Camera,
    title: "Foto dari Jauh",
    desc: "Dokumentasikan untuk kebutuhan laporan tanpa mendekat.",
  },
  {
    icon: PhoneCall,
    title: "Lapor Cepat",
    desc: "Kirim sinyal dalam 60 detik via tombol LAPOR SEKARANG.",
  },
];

const DONT_ITEMS = [
  {
    icon: Hand,
    title: "Hindari Beri Makan",
    desc: "Memberi makan menciptakan ketergantungan & memicu konflik berulang.",
  },
  {
    icon: Zap,
    title: "Hindari Berlari",
    desc: "Lari memicu insting kejar. Bergerak perlahan & terkontrol.",
  },
  {
    icon: Volume2,
    title: "Hindari Berisik",
    desc: "Hindari teriakan, klakson, atau suara mesin keras secara mendadak.",
  },
  {
    icon: Megaphone,
    title: "Hindari Provokasi",
    desc: "Dilarang melempar, memukul, atau mengusir dengan benda apapun.",
  },
];

export function SafetyGuide() {
  return (
    <section id="panduan" className="bg-leaf-50 px-5 py-12">
      <div className="mx-auto max-w-md">
        <h2 className="text-3xl font-extrabold text-forest-900 leading-tight">
          Panduan
          <br />
          Keselamatan Saat
          <br />
          Berjumpa Satwa
        </h2>
        <p className="mt-3 text-sm text-forest-800/80 leading-relaxed">
          IKN adalah rumah bagi ribuan satwa. Mari jadi tetangga yang baik
          dengan mengikuti panduan ini.
        </p>

        <GuideCard
          tone="do"
          title="LAKUKAN"
          icon={Check}
          items={DO_ITEMS}
        />
        <GuideCard
          tone="dont"
          title="HINDARI"
          icon={X}
          items={DONT_ITEMS}
        />
      </div>
    </section>
  );
}

function GuideCard({
  tone,
  title,
  icon: HeaderIcon,
  items,
}: {
  tone: "do" | "dont";
  title: string;
  icon: LucideIcon;
  items: { icon: LucideIcon; title: string; desc: string }[];
}) {
  const isDo = tone === "do";
  return (
    <div
      className={
        "mt-6 rounded-3xl p-4 " +
        (isDo ? "bg-leaf-200" : "bg-danger-50")
      }
    >
      <div className="flex items-center gap-3 px-1 py-2">
        <span
          className={
            "grid place-items-center w-10 h-10 rounded-full text-white " +
            (isDo ? "bg-forest-700" : "bg-danger-500")
          }
        >
          <HeaderIcon className="w-6 h-6" strokeWidth={3} />
        </span>
        <span
          className={
            "text-2xl font-extrabold tracking-wide " +
            (isDo ? "text-forest-800" : "text-danger-600")
          }
        >
          {title}
        </span>
      </div>

      <ul className="mt-2 space-y-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-2xl bg-white p-3"
          >
            <span
              className={
                "grid place-items-center w-10 h-10 rounded-lg shrink-0 " +
                (isDo
                  ? "bg-leaf-100 text-forest-700"
                  : "bg-danger-100 text-danger-600")
              }
            >
              <Icon className="w-5 h-5" />
            </span>
            <div className="leading-snug">
              <p
                className={
                  "font-bold " +
                  (isDo ? "text-forest-900" : "text-danger-600")
                }
              >
                {title}
              </p>
              <p className="text-xs text-forest-800/75 mt-0.5">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
