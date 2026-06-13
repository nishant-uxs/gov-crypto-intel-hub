
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safePublishedAt(value: any) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function triggerIngestIfNeeded(region: string) {
  const shouldAutoFetch = process.env.AUTO_FETCH_NEWS !== "false";
  if (!shouldAutoFetch) return;

  const sources = await prisma.newsSource.findMany({
    where: { isActive: true, region },
  });

  for (const source of sources) {
    try {
      const lastFetchedAt = source.lastFetchedAt?.getTime() || 0;
      const isStale = Date.now() - lastFetchedAt > 15 * 60 * 1000;
      if (!isStale) continue;

      const Parser = require("rss-parser");
      const parser = new Parser();
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items || []) {
        const exists = await prisma.newsItem.findFirst({
          where: { url: item.link || "", sourceId: source.id },
        });
        if (exists) continue;

        await prisma.newsItem.create({
          data: {
            title: item.title || "Untitled",
            summary: (item.contentSnippet || item.content || "").substring(0, 500),
            body: item.content || "",
            url: item.link || "",
            sourceId: source.id,
            region: source.region,
            publishedAt: safePublishedAt(item.pubDate),
            tag: "",
          },
        });
      }

      await prisma.newsSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date(), lastError: null },
      });
    } catch (error: any) {
      await prisma.newsSource.update({
        where: { id: source.id },
        data: { lastError: error?.message || "Auto-fetch failed" },
      });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const region = searchParams.get("region") || "INDIA";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const pageSize = 20;

  await triggerIngestIfNeeded(region);

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

  // If no items found for INDIA, fall back to GLOBAL so the UI shows headlines.
  if ((items?.length || 0) === 0 && region.toUpperCase() === "INDIA") {
    await triggerIngestIfNeeded("GLOBAL");
    const globalWhere = { ...where, region: "GLOBAL" };
    const [gItems, gTotal] = await Promise.all([
      prisma.newsItem.findMany({
        where: globalWhere,
        include: { source: { select: { name: true } } },
        orderBy: [{ isPinned: "desc" }, { isBreaking: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsItem.count({ where: globalWhere }),
    ]);

    return NextResponse.json({
      items: gItems,
      total: gTotal,
      totalPages: Math.ceil(gTotal / pageSize),
      page,
      fallback: "GLOBAL",
    });
  }

  return NextResponse.json({
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  });
}
