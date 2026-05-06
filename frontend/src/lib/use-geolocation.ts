"use client";

import { useCallback, useEffect, useState } from "react";

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Geolocation tidak didukung oleh browser Anda",
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          loading: false,
          error: null,
        });
      },
      (err) => {
        let message = "Gagal mendapatkan lokasi";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Izin lokasi ditolak. Aktifkan di pengaturan browser.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Lokasi tidak tersedia saat ini";
        } else if (err.code === err.TIMEOUT) {
          message = "Waktu permintaan lokasi habis";
        }
        setState((s) => ({ ...s, loading: false, error: message }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refresh: fetch };
}
