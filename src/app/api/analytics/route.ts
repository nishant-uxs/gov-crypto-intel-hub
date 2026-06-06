
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tdsData = await prisma.advisoryTds.findMany({ orderBy: { fyLabel: "asc" } });
  const exchanges = await prisma.exchange.findMany();
  const enforcementItems = await prisma.newsItem.findMany({
    where: { tag: "ENFORCEMENT", region: "INDIA" },
    select: { publishedAt: true },
  });
  const stateData = await prisma.advisoryState.findMany();
  const gstData = await prisma.advisoryGst.findMany();

  const riskCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  exchanges.forEach((e) => { if (riskCounts[e.riskLevel] !== undefined) riskCounts[e.riskLevel]++; });

  const yearCounts: Record<string, number> = {};
  enforcementItems.forEach((item) => {
    const y = new Date(item.publishedAt).getFullYear().toString();
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  const indiaScamLosses = stateData.reduce((sum, s) => sum + s.scamLossesCr, 0);
  const totalGstEvaded = gstData.reduce((sum, g) => sum + g.amountEvadedCr, 0);

  return NextResponse.json({
    tdsTrend: {
      labels: tdsData.map((d) => d.fyLabel),
      datasets: [{
        label: "TDS Collection (Rs Cr)",
        data: tdsData.map((d) => d.amountCr),
        backgroundColor: tdsData.map((d) => d.isProjection ? "#4c6ef5" : "#3b5bdb"),
      }],
    },
    enforcementTimeline: {
      labels: Object.keys(yearCounts).sort(),
      datasets: [{
        label: "Enforcement Actions",
        data: Object.keys(yearCounts).sort().map((y) => yearCounts[y]),
        backgroundColor: "#dc2626",
      }],
    },
    exchangeRisk: {
      labels: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      datasets: [{
        data: [riskCounts.CRITICAL, riskCounts.HIGH, riskCounts.MEDIUM, riskCounts.LOW],
        backgroundColor: ["#dc2626", "#ea580c", "#ca8a04", "#16a34a"],
      }],
    },
    scamLosses: {
      labels: stateData.length > 0 ? stateData.map((s) => s.stateName) : ["India", "Global"],
      datasets: [{
        label: "Scam Losses (Rs Cr)",
        data: stateData.length > 0 ? stateData.map((s) => s.scamLossesCr) : [indiaScamLosses || 72000, 136000],
        backgroundColor: stateData.length > 0
          ? ["#f97316","#3b82f6","#8b5cf6","#ef4444","#22c55e","#eab308","#06b6d4","#ec4899"]
          : ["#f97316", "#8b5cf6"],
      }],
    },
    summary: {
      indiaScamLossesCr: indiaScamLosses,
      totalGstEvadedCr: totalGstEvaded,
      fiuRegisteredExchanges: exchanges.filter(e => e.status === "active").length,
      totalStatesTracked: stateData.length,
    },
  });
}
