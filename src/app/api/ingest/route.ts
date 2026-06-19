
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classifyByKeywords, isCryptoRelated } from "@/lib/tagger";

function safePublishedAt(value: any) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export async function POST() {
  try {
    const sources = await prisma.newsSource.findMany({
      where: { isActive: true },
    });

    let ingested = 0;
    let skipped = 0;
    let errors = 0;

    for (const source of sources) {
      try {
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

          // Skip non-crypto news items
          if (!tag && !isCryptoRelated(title, summary)) {
            skipped++;
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
              tag: tag || "BLOCKCHAIN",
            },
          });
          ingested++;
        }

        await prisma.newsSource.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date(), lastError: null },
        });
      } catch (e: any) {
        errors++;
        await prisma.newsSource.update({
          where: { id: source.id },
          data: { lastError: e.message },
        });
      }
    }

    return NextResponse.json({ ingested, skipped, errors, sources: sources.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
