"use client";

import Image from "next/image";
import { Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPECIES = [
  {
    badge: "Sangat Terancam",
    name: "Orangutan",
    latin: "Pongo pygmaeus morio",
    population: "± 1.200",
    trend: "Menurun Tajam",
    habitat: "Hutan hujan dataran rendah dan koridor riparian yang masih rapat.",
    note:
      "Primata besar berambut cokelat kemerahan dengan kecerdasan tinggi. Orangutan sangat sensitif pada fragmentasi habitat dan gangguan suara berat.",
    image: "/Group.svg",
    imageAlt: "Ilustrasi Orangutan",
    imageClassName:
      "right-[-0.75rem] top-[5.75rem] w-48 sm:right-[-0.5rem] sm:top-[5.25rem] sm:w-52",
    stars: [
      "right-[4.5rem] top-16",
      "right-4 top-24 scale-[0.58]",
      "left-6 top-[18rem] scale-[0.85]",
    ],
  },
  {
    badge: "Rentan",
    name: "Burung Enggang",
    latin: "Buceros rhinoceros",
    population: "± 2.000",
    trend: "Menurun Lambat",
    habitat: "Hutan hujan primer dengan pohon-pohon besar untuk bersarang.",
    note:
      "Burung besar dengan paruh oranye-merah yang ikonik. Dalam budaya lokal, enggang dianggap sebagai panglima penjaga hutan dan penanda ekosistem sehat.",
    image: "/Enggang1-1%201.svg",
    imageAlt: "Ilustrasi Burung Enggang",
    imageClassName:
      "right-[-1.35rem] top-[5.5rem] w-52 sm:right-[-1rem] sm:top-[5rem] sm:w-56",
    stars: [
      "right-[8.5rem] top-20",
      "right-6 top-[17rem] scale-[0.88]",
      "right-1 top-[16rem] scale-[0.55]",
    ],
  },
  {
    badge: "Rentan",
    name: "Beruang Madu",
    latin: "Helarctos malayanus",
    population: "± 800",
    trend: "Stabil di Area Penyangga",
    habitat: "Hutan hujan tropis dataran rendah dengan pohon berbuah dan sarang serangga.",
    note:
      "Mamalia berbulu hitam pendek dengan tanda dada berbentuk bulan sabit. Mereka sering berpindah mengikuti sumber pakan dan sangat mengandalkan tutupan hutan.",
    image: "/Group(1).svg",
    imageAlt: "Ilustrasi Beruang Madu",
    imageClassName:
      "right-1 top-[5rem] w-40 sm:right-2 sm:top-[4.75rem] sm:w-44",
    stars: [
      "right-[4rem] top-16",
      "right-1 top-24 scale-[0.58]",
      "left-4 top-[18.25rem] scale-[0.85]",
    ],
  },
] as const;

function SpeciesStar({ className }: { className: string }) {
  return (
    <Sparkles
      className={`absolute h-7 w-7 fill-white text-white ${className}`}
      strokeWidth={1.6}
    />
  );
}

export function Species() {
  const [active, setActive] = useState(0);
  const species = SPECIES[active];

  return (
    <section id="spesies" className="bg-leaf-50 px-5 py-12">
      <div className="mx-auto max-w-md">
        <h2 className="text-3xl font-extrabold leading-tight text-forest-900">
          Tetangga Kita di IKN
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-forest-800/80">
          Tiga spesies kunci yang paling sering beririsan dengan zona
          pembangunan IKN. Kenali cirinya agar respons lapangan tetap aman dan
          habitatnya tetap terlindungi.
        </p>

        <article className="relative mt-6 overflow-hidden rounded-[2rem] border border-forest-200/40 bg-[radial-gradient(circle_at_top,#d4f2d6_0%,#9ad6a5_43%,#5b8e67_100%)] p-6 shadow-[0_18px_40px_rgba(57,95,68,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.05)_34%,rgba(255,255,255,0)_60%)]" />
          <div className="absolute bottom-24 right-0 h-40 w-56 rounded-tl-[7rem] bg-white/12" />
          <div className="absolute left-10 top-24 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {species.stars.map((starClass, index) => (
                <SpeciesStar key={`${species.name}-${index}`} className={starClass} />
              ))}

              <div className="relative z-10 pr-36 text-forest-800 sm:pr-40">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-bold shadow-sm">
                  {species.badge}
                </span>

                <h3 className="mt-4 text-[2.1rem] font-extrabold leading-[0.98] sm:text-[2.35rem]">
                  {species.name}
                </h3>
                <p className="mt-3 text-lg italic text-forest-800/80">
                  {species.latin}
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <p className="flex items-center gap-2 text-[0.95rem] font-semibold uppercase tracking-wide text-forest-800/85">
                      <Users className="h-5 w-5" />
                      Populasi di IKN
                    </p>
                    <p className="mt-1 text-[1.95rem] font-extrabold leading-none">
                      {species.population}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.95rem] font-semibold uppercase tracking-wide text-forest-800/85">
                      Tren di IKN
                    </p>
                    <p className="mt-1 max-w-[12rem] text-[1.15rem] font-extrabold leading-tight sm:text-[1.3rem]">
                      {species.trend}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.95rem] font-semibold uppercase tracking-wide text-forest-800/85">
                      Habitat Utama
                    </p>
                    <p className="mt-2 max-w-[12rem] text-[1rem] font-semibold leading-snug text-forest-800/85">
                      {species.habitat}
                    </p>
                  </div>
                </div>
              </div>

              <Image
                src={species.image}
                alt={species.imageAlt}
                width={260}
                height={300}
                className={`absolute h-auto max-w-none drop-shadow-[0_14px_24px_rgba(35,62,45,0.24)] ${species.imageClassName}`}
                priority={active === 0}
              />

              <div className="relative z-10 mt-8 rounded-2xl border border-white/85 bg-forest-700/58 px-5 py-5 text-center text-base leading-tight text-white backdrop-blur-[2px] sm:px-6 sm:text-[1.05rem]">
                {species.note}
              </div>
            </motion.div>
          </AnimatePresence>
        </article>

        <div className="mt-4 flex justify-center gap-2">
          {SPECIES.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Tampilkan ${item.name}`}
              aria-pressed={index === active}
              className={
                "h-2.5 rounded-full transition-all " +
                (index === active ? "w-7 bg-forest-700" : "w-2.5 bg-forest-200")
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
