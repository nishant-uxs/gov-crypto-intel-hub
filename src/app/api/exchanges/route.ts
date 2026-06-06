
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const risk = searchParams.get("risk") || "";

  const where: any = {};
  if (status) where.status = status;
  if (risk) where.riskLevel = risk;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const exchanges = await prisma.exchange.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const parsed = exchanges.map((ex) => ({
    ...ex,
    notices: JSON.parse(ex.notices || "[]"),
    alerts: JSON.parse(ex.alerts || "[]"),
  }));

  return NextResponse.json(parsed);
}
