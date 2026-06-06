
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { daysUntil } from "@/lib/utils";

export async function GET() {
  const kpis = await prisma.kpi.findMany({ orderBy: { label: "asc" } });
  const exchangeCount = await prisma.exchange.count({ where: { status: "active" } });
  const micaDays = daysUntil(new Date("2027-06-30"));

  const result = kpis.map((kpi) => {
    if (kpi.computeKey === "fiu_vasp_count") return { ...kpi, value: String(exchangeCount) };
    if (kpi.computeKey === "mica_countdown") return { ...kpi, value: String(micaDays) + " days" };
    return kpi;
  });

  return NextResponse.json(result);
}
