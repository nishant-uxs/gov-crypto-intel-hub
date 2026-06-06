
import { Header } from "@/components/layout/Header";
import { KpiStrip } from "@/components/layout/KpiStrip";
import { DashboardTabs } from "@/components/layout/DashboardTabs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <KpiStrip />
      <DashboardTabs />
    </div>
  );
}
