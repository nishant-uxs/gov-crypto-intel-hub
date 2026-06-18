
import { prisma } from "./prisma";

function safePublishedAt(value: any) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function ingestSource(source: any) {
  try {
    const Parser = require("rss-parser");
    const parser = new Parser();
    const feed = await parser.parseURL(source.url);

    let count = 0;
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
      count++;
    }

    await prisma.newsSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date(), lastError: null },
    });

    console.log(`[${source.name}] Ingested ${count} new items`);
    return { source: source.name, count, error: null };
  } catch (e: any) {
    await prisma.newsSource.update({
      where: { id: source.id },
      data: { lastError: e.message },
    });
    console.error(`[${source.name}] Error: ${e.message}`);
    return { source: source.name, count: 0, error: e.message };
  }
}

async function autoTagItems() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("No ANTHROPIC_API_KEY set — skipping auto-tagging");
    return;
  }

  const untagged = await prisma.newsItem.findMany({
    where: { tag: "" },
    take: 50,
    orderBy: { publishedAt: "desc" },
  });

  if (untagged.length === 0) return;

  for (const item of untagged) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-20250514",
          max_tokens: 20,
          system: "Classify crypto/blockchain news into one tag: POLICY, ENFORCEMENT, COMPLIANCE, SCAM, CRYPTO_SCAM, MARKET, INNOVATION, or BLOCKCHAIN. Use CRYPTO_SCAM for news about specific crypto scam incidents, fraud cases, or scam warnings. Use BLOCKCHAIN for general blockchain technology news, DeFi, NFTs, or Web3 developments. Reply with only the tag.",
          messages: [{
            role: "user",
            content: `Title: ${item.title}\nSummary: ${item.summary.substring(0, 300)}`,
          }],
        }),
      });

      const result = await response.json();
      const tag = result.content?.[0]?.text?.trim() || "";

      const validTags = ["POLICY", "ENFORCEMENT", "COMPLIANCE", "SCAM", "CRYPTO_SCAM", "MARKET", "INNOVATION", "BLOCKCHAIN"];
      if (validTags.includes(tag)) {
        await prisma.newsItem.update({
          where: { id: item.id },
          data: { tag },
        });
      }
    } catch (e) {
      console.error(`Tagging error for ${item.id}: ${e}`);
    }
  }

  console.log(`Auto-tagged ${untagged.length} items`);
}

async function main() {
  console.log("Starting ingestion pipeline...");
  const sources = await prisma.newsSource.findMany({ where: { isActive: true } });

  for (const source of sources) {
    await ingestSource(source);
  }

  await autoTagItems();
  console.log("Ingestion complete");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
