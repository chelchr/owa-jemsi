"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; openModal: () => void; closeModal: () => void };

const ReportCtx = createContext<Ctx | null>(null);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ReportCtx.Provider
      value={{
        open,
        openModal: () => setOpen(true),
        closeModal: () => setOpen(false),
      }}
    >
      {children}
    </ReportCtx.Provider>
  );
}

export function useReportModal() {
  const ctx = useContext(ReportCtx);
  if (!ctx) throw new Error("useReportModal must be used within ReportProvider");
  return ctx;
}
