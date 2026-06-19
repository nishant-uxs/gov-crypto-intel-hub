
import { prisma } from "./prisma";
import { classifyByKeywords, isCryptoRelated } from "./tagger";

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
    let skipped = 0;
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
      count++;
    }

    await prisma.newsSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date(), lastError: null },
    });

    console.log(`[${source.name}] Ingested ${count} new items, skipped ${skipped} non-crypto items`);
    return { source: source.name, count, skipped, error: null };
  } catch (e: any) {
    await prisma.newsSource.update({
      where: { id: source.id },
      data: { lastError: e.message },
    });
    console.error(`[${source.name}] Error: ${e.message}`);
    return { source: source.name, count: 0, skipped: 0, error: e.message };
  }
}

async function autoTagExistingItems() {
  console.log("Auto-tagging existing untagged items...");

  const untagged = await prisma.newsItem.findMany({
    where: { tag: "" },
    orderBy: { publishedAt: "desc" },
  });

  if (untagged.length === 0) {
    console.log("No untagged items found.");
    return;
  }

  let tagged = 0;
  let suppressed = 0;

  for (const item of untagged) {
    const tag = classifyByKeywords(item.title, item.summary);
    if (tag) {
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { tag },
      });
      tagged++;
    } else if (!isCryptoRelated(item.title, item.summary)) {
      // Suppress non-crypto items
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { isSuppressed: true, tag: "UNRELATED" },
      });
      suppressed++;
    } else {
      await prisma.newsItem.update({
        where: { id: item.id },
        data: { tag: "BLOCKCHAIN" },
      });
      tagged++;
    }
  }

  console.log(`Auto-tagged ${tagged} items, suppressed ${suppressed} non-crypto items`);
}

async function autoTagItemsWithAI() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("No ANTHROPIC_API_KEY set — skipping AI auto-tagging");
    return;
  }

  // Only re-tag items that were keyword-tagged (AI might do better)
  const keywordTagged = await prisma.newsItem.findMany({
    where: {
      tag: { not: "" },
      isSuppressed: false,
    },
    take: 50,
    orderBy: { publishedAt: "desc" },
  });

  if (keywordTagged.length === 0) return;

  for (const item of keywordTagged) {
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

  console.log(`AI-tagged ${keywordTagged.length} items`);
}

async function main() {
  console.log("Starting ingestion pipeline...");
  const sources = await prisma.newsSource.findMany({ where: { isActive: true } });

  for (const source of sources) {
    await ingestSource(source);
  }

  // First pass: keyword-based tagging (fast, no API needed)
  await autoTagExistingItems();

  // Second pass: AI-based tagging (optional, requires API key)
  await autoTagItemsWithAI();

  console.log("Ingestion complete");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
