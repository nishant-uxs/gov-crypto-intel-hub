
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const risk = searchParams.get("risk") || "";

  const where: any = {};
  if (risk) where.riskLevel = risk;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const scams = await prisma.scamType.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const parsed = scams.map((s) => ({
    ...s,
    vectors: JSON.parse(s.vectors || "[]"),
    redFlags: JSON.parse(s.redFlags || "[]"),
    linkedNewsIds: JSON.parse(s.linkedNewsIds || "[]"),
  }));

  return NextResponse.json(parsed);
}
