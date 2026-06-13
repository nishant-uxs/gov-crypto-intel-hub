
import { Header } from "@/components/layout/Header";
import { KpiStrip } from "@/components/layout/KpiStrip";
import { DashboardTabs } from "@/components/layout/DashboardTabs";

async function runIngestWithTimeout(timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Use absolute URL based on NEXTAUTH_URL or localhost fallback
    const base = process.env.NEXTAUTH_URL || "http://localhost:3001";
    await fetch(`${base}/api/ingest`, { method: "POST", signal: controller.signal });
  } catch (e) {
    // ignore errors: ingestion should not break page render
  } finally {
    clearTimeout(id);
  }
}

export default async function Home() {
  // Trigger ingestion on each page render but do not block long-running requests
  await runIngestWithTimeout(4000);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <KpiStrip />
      <DashboardTabs />
    </div>
  );
}
