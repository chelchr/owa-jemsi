"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useReportModal } from "./report-context";

const MENU_ITEMS = [
  { label: "Peta", href: "#peta" },
  { label: "Satwa", href: "#spesies" },
  { label: "Edukasi", href: "#panduan" },
  { label: "Statistik", href: "#statistik" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { openModal } = useReportModal();

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 -mb-20 px-5 pt-2">
      <div className="mx-auto max-w-md">
        <div className="relative">
          <div className="overflow-hidden rounded-[1.15rem] border border-leaf-100 bg-white shadow-[0_10px_24px_rgba(26,66,38,0.08)]">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-100">
                  <Image
                    src="/icon-park-solid_report.png"
                    alt="Owa Jemsi"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </span>
                <span className="text-lg font-extrabold tracking-tight text-forest-800">
                  Owa Jemsi
                </span>
              </div>
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? "Tutup menu" : "Buka menu"}
                onClick={() => setOpen((current) => !current)}
                className={
                  "grid h-10 w-10 place-items-center rounded-xl border transition-colors " +
                  (open
                    ? "border-leaf-200 bg-leaf-200 text-forest-700"
                    : "border-transparent bg-white text-forest-800 hover:bg-leaf-50")
                }
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {open ? (
            <nav
              aria-label="Navigasi utama"
              className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-[1.15rem] border border-leaf-100 bg-white px-4 pb-4 pt-2 shadow-[0_18px_40px_rgba(26,66,38,0.12)]"
            >
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openModal();
                }}
                className="block w-full py-2 text-left text-sm font-semibold text-forest-700 transition-colors hover:text-forest-900"
              >
                Lapor
              </button>
              {MENU_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="block py-2 text-sm font-semibold text-forest-700 transition-colors hover:text-forest-900"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
