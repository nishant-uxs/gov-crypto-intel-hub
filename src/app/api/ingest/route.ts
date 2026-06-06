
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const sources = await prisma.newsSource.findMany({
      where: { isActive: true },
    });

    let ingested = 0;
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

          await prisma.newsItem.create({
            data: {
              title: item.title || "Untitled",
              summary: item.contentSnippet || item.content || "",
              body: item.content || "",
              url: item.link || "",
              sourceId: source.id,
              region: source.region,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              tag: "",
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

    return NextResponse.json({ ingested, errors, sources: sources.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
