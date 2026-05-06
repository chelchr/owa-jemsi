"use client";

import { CheckCircle, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastType = "success" | "error";

interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

let _addToast: (type: ToastType, message: string) => void = () => {};

/**
 * Call from anywhere:
 *   toast.success("Laporan berhasil dikirim!")
 *   toast.error("Gagal mengirim laporan")
 */
export const toast = {
  success: (msg: string) => _addToast("success", msg),
  error: (msg: string) => _addToast("error", msg),
};

let nextId = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    _addToast = (type, message) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold animate-in slide-in-from-right-4 duration-300 " +
            (t.type === "success"
              ? "bg-forest-700 text-white"
              : "bg-danger-500 text-white")
          }
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="p-1 rounded hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
