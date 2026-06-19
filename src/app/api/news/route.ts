
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyByKeywords, isCryptoRelated } from "@/lib/tagger";

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

        const title = item.title || "Untitled";
        const summary = (item.contentSnippet || item.content || "").substring(0, 500);

        // Auto-tag using keyword classifier
        const tag = classifyByKeywords(title, summary);

        // Skip non-crypto news items from general sources
        if (!tag && !isCryptoRelated(title, summary)) {
          continue;
        }

        await prisma.newsItem.create({
          data: {
            title,
            summary,
            body: item.content || "",
            url: item.link || "",
            sourceId: source.id,
            region: source.region,
            publishedAt: safePublishedAt(item.pubDate),
            tag: tag || "BLOCKCHAIN", // Default to BLOCKCHAIN for crypto-related but unclassified
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

/**
 * Auto-tag existing untagged items in the database using keyword classification.
 * This runs lazily when items are fetched.
 */
async function autoTagUntaggedItems() {
  const untagged = await prisma.newsItem.findMany({
    where: { tag: "" },
    take: 100,
    orderBy: { publishedAt: "desc" },
  });

  if (untagged.length === 0) return;

  for (const item of untagged) {
    const tag = classifyByKeywords(item.title, item.summary);
    if (tag) {
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { tag },
      });
    } else if (!isCryptoRelated(item.title, item.summary)) {
      // Suppress non-crypto news items so they don't show up
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { isSuppressed: true, tag: "UNRELATED" },
      });
    } else {
      // Crypto-related but can't classify specifically — default to BLOCKCHAIN
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { tag: "BLOCKCHAIN" },
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

  // Auto-tag any untagged items in the background
  autoTagUntaggedItems().catch((e) =>
    console.error("Auto-tag error:", e.message)
  );

  const where: any = {
    region,
    isSuppressed: false,
  };

  if (tag) {
    // Specific tag filter — no need for NOT clause
    where.tag = tag;
  } else {
    // No tag filter — exclude unrelated and empty-tagged items
    where.tag = { notIn: ["UNRELATED", ""] };
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ],
      },
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
