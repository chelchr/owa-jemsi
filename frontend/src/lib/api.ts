const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/* ── Types ── */

export interface Report {
  id: number;
  latitude: number;
  longitude: number;
  species: string;
  risk_level: string;
  description: string;
  photo_url: string;
  ai_confidence: number;
  prediction_source: string;
  created_at: string;
}

export interface Stats {
  total: number;
  tinggi: number;
  sedang: number;
  rendah: number;
}

/* ── Submit a new report ── */

export async function submitReport(data: {
  photo: File;
  species: string;
  description: string;
  latitude: number;
  longitude: number;
}): Promise<Report> {
  const form = new FormData();
  form.append("photo", data.photo);
  form.append("species", data.species);
  form.append("description", data.description);
  form.append("latitude", String(data.latitude));
  form.append("longitude", String(data.longitude));

  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Gagal mengirim laporan");
  }

  return res.json();
}

/* ── Get all reports (optional filters) ── */

export async function getReports(filters?: {
  species?: string;
  risk?: string;
}): Promise<Report[]> {
  const params = new URLSearchParams();
  if (filters?.species) params.set("species", filters.species);
  if (filters?.risk) params.set("risk", filters.risk);

  const qs = params.toString();
  const url = `${API_BASE}/reports${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data laporan");

  return res.json();
}

/* ── Get stats ── */

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil statistik");

  return res.json();
}

/* ── Photo URL helper ── */

export function photoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}
