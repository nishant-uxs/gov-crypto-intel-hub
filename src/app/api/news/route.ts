
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const region = searchParams.get("region") || "INDIA";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const pageSize = 20;

  const where: any = {
    region,
    isSuppressed: false,
  };

  if (tag) where.tag = tag;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      include: { source: { select: { name: true } } },
      orderBy: [{ isPinned: "desc" }, { isBreaking: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsItem.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  });
}
