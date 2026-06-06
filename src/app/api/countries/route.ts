
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const stance = searchParams.get("stance") || "";

  const where: any = {};
  if (stance) where.stance = stance;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const countries = await prisma.country.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(countries);
}
