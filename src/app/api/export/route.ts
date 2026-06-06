
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const table = searchParams.get("table") || "news";

  let data: any[] = [];
  switch (table) {
    case "news":
      data = await prisma.newsItem.findMany({ include: { source: { select: { name: true } } }, orderBy: { publishedAt: "desc" }, take: 500 });
      break;
    case "exchanges":
      data = await prisma.exchange.findMany({ orderBy: { name: "asc" } });
      data = data.map((d) => ({ ...d, assets: JSON.parse(d.assets||"[]"), notices: JSON.parse(d.notices||"[]"), alerts: JSON.parse(d.alerts||"[]") }));
      break;
    case "scams":
      data = await prisma.scamType.findMany({ orderBy: { name: "asc" } });
      data = data.map((d) => ({ ...d, vectors: JSON.parse(d.vectors||"[]"), redFlags: JSON.parse(d.redFlags||"[]") }));
      break;
    case "countries":
      data = await prisma.country.findMany({ orderBy: { name: "asc" } });
      break;
    case "kpis":
      data = await prisma.kpi.findMany({ orderBy: { label: "asc" } });
      break;
    default:
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  if (format === "csv") {
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(","), ...data.map((row: any) => headers.map((h) => JSON.stringify(row[h]||"")).join(","))].join("\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${table}-${new Date().toISOString().slice(0,10)}.csv"` } });
  }

  return NextResponse.json(data);
}
