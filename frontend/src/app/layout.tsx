import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Owa Jemsi — Lindungi Satwa, Lapor Cepat",
  description:
    "Sistem pelaporan cepat satwa liar di kawasan IKN. Tanpa login, cukup foto dan kirim lokasi presisi dalam hitungan detik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-leaf-50 text-forest-900 font-sans">
        {children}
      </body>
    </html>
  );
}
