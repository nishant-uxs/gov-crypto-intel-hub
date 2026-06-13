import { prisma } from "../src/lib/prisma";

const sources = [
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "NYTimes Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "NYTimes World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "NYTimes Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "RSS", region: "GLOBAL", frequencyHours: 1 },
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", type: "RSS", region: "GLOBAL", frequencyHours: 2 },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss", type: "RSS", region: "GLOBAL", frequencyHours: 2 },
];

async function main() {
  for (const source of sources) {
    await prisma.newsSource.upsert({
      where: { id: source.name.toLowerCase().replace(/[^a-z0-9]/g, "-") },
      update: { ...source, isActive: true, lastError: null },
      create: { id: source.name.toLowerCase().replace(/[^a-z0-9]/g, "-"), ...source },
    });
  }

  await prisma.newsSource.updateMany({
    where: {
      name: {
        in: [
          "Ministry of Finance",
          "RBI Notifications",
          "SEBI",
          "FATF",
          "IMF",
          "FCA UK",
          "MAS Singapore",
          // Known failing or blocked feeds — deactivate
          "Reuters Top News",
          "Reuters Business News",
          "Reuters World News",
          "Reuters Markets News",
          "Reuters Technology News",
          "Reuters Crypto Watch",
          "AP Business News",
          "AP World News",
          "AP Technology News",
          "AP Financial Markets",
          "AP Top News",
          "AP U.S. News",
          "CNBC",
          "TheBlock",
        ],
      },
    },
    data: { isActive: false, lastError: null },
  });

  console.log(`Updated ${sources.length} active news sources`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
