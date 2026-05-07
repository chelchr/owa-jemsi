"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Report, photoUrl } from "@/lib/api";

const customIcon = (colorClass: string) => {
  return new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${colorClass}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const getColor = (species: string) => {
  switch (species.toLowerCase()) {
    case "beruang":
    case "beruang madu":
      return "bg-danger-500";
    case "enggang":
      return "bg-orange-brand";
    case "orangutan":
      return "bg-amber-500";
    default:
      return "bg-forest-700";
  }
};

export default function MapClient({ reports }: { reports: Report[] }) {
  // Koordinat IKN (approx)
  const center: [number, number] = [-0.97, 116.7];

  return (
    <div
      className="rounded-2xl border border-leaf-100 overflow-hidden relative z-0"
      style={{ height: 400 }}
    >
      <MapContainer
        center={center}
        zoom={9}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        {reports.map((r, index) => (
          <Marker
            key={r.id || `fallback-${index}`}
            position={[r.latitude, r.longitude]}
            icon={customIcon(getColor(r.species))}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                {r.photo_url && (
                  <img
                    src={photoUrl(r.photo_url)}
                    alt={r.species}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="font-bold text-forest-900">{r.species}</p>
                <p className="text-[10px] text-forest-700/70 mb-1">
                  {new Date(r.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-forest-800">
                  {r.description || "Tidak ada catatan"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-leaf-100 text-forest-800 uppercase">
                    Resiko: {r.risk_level || "UNKNOWN"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-leaf-100 text-forest-800 uppercase">
                    AI: {(r.ai_confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
