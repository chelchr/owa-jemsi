import Image from "next/image";
import { Mail, Radio, PhoneCall, Sprout } from "lucide-react";

const LINKS = [
  { label: "Lapor HERU", href: "#hero" },
  { label: "Peta Konflik", href: "#peta" },
  { label: "Spesies Dilindungi", href: "#spesies" },
  { label: "Panduan Keselamatan", href: "#panduan" },
  { label: "Statistik Interaksi Satwa", href: "#statistik" },
];

const CONTACTS = [
  {
    label: "BKSDA Kaltim",
    value: "0811-5400-9000",
    icon: PhoneCall,
  },
  {
    label: "HERU Field Net",
    value: "Kanal 7 – VHF",
    icon: Radio,
  },
  {
    label: "heru@owajemsi.id",
    value: "",
    icon: Mail,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#eef5ea_0%,#dbeacd_100%)] px-5 pb-8 pt-16">
      <div className="absolute inset-x-[-34%] top-[-4.5rem] h-[20rem] rounded-[50%] bg-[radial-gradient(ellipse_at_center,#b6dfb0_0%,#a5d6a8_52%,#91c494_100%)]" />
      <div className="absolute inset-x-[-30%] top-[9.75rem] h-24 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(225,240,218,0.96)_0%,rgba(213,234,205,0.92)_48%,rgba(197,224,191,0.72)_100%)]" />
      <div className="absolute inset-x-[-26%] top-[10.75rem] h-14 rounded-[50%] bg-[linear-gradient(180deg,rgba(153,205,161,0.34)_0%,rgba(153,205,161,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.08)_20%,rgba(255,255,255,0)_42%)]" />
      <div className="absolute left-[-5rem] top-24 h-80 w-80 rounded-full bg-white/14 blur-3xl" />
      <div className="absolute right-[-6rem] top-12 h-[22rem] w-[22rem] rounded-full bg-[#8fc796]/18 blur-3xl" />

      <div className="relative mx-auto max-w-md text-forest-800">
        <div className="max-w-[15rem]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start gap-1">
              <span className="grid h-12 w-12 place-items-center text-forest-800">
                <Image src="/icon-park-solid_report.svg" alt="Owa Jemsi" width={64} height={64} />
              </span>
            </div>
            <h2 className="text-[2.0rem] font-extrabold leading-none">
              Owa Jemsi
            </h2>
          </div>

          <p className="mt-6 text-[1.05rem] leading-[1.55] text-forest-800/85">
            Melalui sistem pelaporan HERU, kami menghubungkan pekerja lapangan
            secara real-time dengan tim ahli untuk memastikan keselamatan
            manusia dan perlindungan satwa endemik di kawasan IKN.
          </p>
        </div>

        <div className="mt-10 max-w-[14rem]">
          <p className="text-[0.95rem] font-extrabold uppercase tracking-[0.12em] text-forest-800/85">
            Tautan
          </p>
          <ul className="mt-4 space-y-3">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[1.05rem] font-semibold leading-none text-forest-800/90 transition-colors hover:text-forest-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 max-w-[15rem]">
          <p className="text-[0.95rem] font-extrabold uppercase tracking-[0.12em] text-forest-800/85">
            Kontak Darurat
          </p>
          <ul className="mt-4 space-y-4">
            {CONTACTS.map((contact) => {
              const Icon = contact.icon;

              return (
                <li key={contact.label} className="flex items-start gap-3">
                  <span className="mt-1 text-orange-brand">
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </span>
                  <div className="text-[0.95rem] leading-tight text-forest-800/92">
                    {contact.value ? (
                      <>
                        <p className="font-extrabold">{contact.label}</p>
                        <p className="mt-1 text-[0.9em] text-forest-800/82">
                          {contact.value}
                        </p>
                      </>
                    ) : (
                      <p className="pt-0.5 font-medium">{contact.label}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-20 text-[0.92rem] font-medium text-forest-800/88">
          © 2026 OWA JEMSI · IKN, Kalimantan Timur.
        </p>
      </div>

      <div className="pointer-events-none absolute right-0 top-52 w-[13.5rem]">
        <Image
          src="/OWA2%201.svg"
          alt="Ilustrasi Owa Jemsi"
          width={260}
          height={320}
          className="ml-auto h-auto w-full max-w-none drop-shadow-[0_14px_20px_rgba(62,86,67,0.14)]"
          priority
        />
      </div>

      <div className="pointer-events-none absolute bottom-28 right-3 w-[11.5rem]">
        <Image
          src="/sunbear2%201.svg"
          alt="Ilustrasi Beruang Madu"
          width={240}
          height={200}
          className="ml-auto h-auto w-full max-w-none drop-shadow-[0_14px_20px_rgba(62,86,67,0.14)]"
          priority
        />
      </div>
    </footer>
  );
}
