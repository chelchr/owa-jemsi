import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { IncidentMap } from "@/components/landing/incident-map";
import { ReportProvider } from "@/components/landing/report-context";
import { ReportModal } from "@/components/landing/report-form";
import { SafetyGuide } from "@/components/landing/safety-guide";
import { Species } from "@/components/landing/species";
import { Trends } from "@/components/landing/trends";
import { ToastContainer } from "@/components/ui/toast";

export default function Home() {
  return (
    <ReportProvider>
      <main className="min-h-screen bg-leaf-50">
        <Header />
        <Hero />
        <IncidentMap />
        <Species />
        <SafetyGuide />
        <Trends />
        <Footer />
      </main>
      <ReportModal />
      <ToastContainer />
    </ReportProvider>
  );
}
