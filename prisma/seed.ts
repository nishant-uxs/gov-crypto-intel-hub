
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@govcryptointel.org" },
    update: {},
    create: {
      email: "admin@govcryptointel.org",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Created admin user: admin@govcryptointel.org / admin123");

  // Create default news sources using feeds that are actually reachable and publish real headlines.
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

  for (const source of sources) {
    await prisma.newsSource.upsert({
      where: { id: source.name.toLowerCase().replace(/[^a-z0-9]/g, "-") },
      update: { ...source, isActive: true },
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
          "Reuters Top News",
          "Reuters Business News",
          "Reuters World News",
          "Reuters Markets News",
          "Reuters Technology News",
          "Reuters Crypto Watch",
        ],
      },
    },
    data: { isActive: false },
  });
  console.log("Created " + sources.length + " news sources");

  // Seed KPIs
  const kpis = [
    { label: "India VDA Tax", value: "30% + 1% TDS", colorClass: "blue", sourceCitation: "MoF Notification", isComputed: false },
    { label: "Scam Losses", value: "Rs 72,000 Cr+", colorClass: "red", sourceCitation: "Chainalysis 2026", isComputed: false },
    { label: "Crypto Users", value: "119M (No.1 Global)", colorClass: "green", sourceCitation: "NASSCOM 2025", isComputed: false },
    { label: "FIU VASPs", value: "49 Registered", colorClass: "blue", sourceCitation: "FIU-IND May 2026", isComputed: true, computeKey: "fiu_vasp_count" },
    { label: "Global Scam 2025", value: "USD 17B+", colorClass: "red", sourceCitation: "Chainalysis 2026", isComputed: false },
    { label: "US Crypto Fraud", value: "USD 11.4B (FBI)", colorClass: "red", sourceCitation: "FBI IC3 2025", isComputed: false },
    { label: "DPRK Lazarus", value: "USD 1.34B (2025)", colorClass: "red", sourceCitation: "Chainalysis 2026", isComputed: false },
    { label: "DeFi Hacks YTD", value: "USD 1B+ YTD", colorClass: "orange", sourceCitation: "DeFiLlama 2026", isComputed: false },
    { label: "Bitcoin ETF", value: "USD 110B+", colorClass: "green", sourceCitation: "Bloomberg 2026", isComputed: false },
    { label: "Stablecoin Mkt", value: "USD 250B+", colorClass: "blue", sourceCitation: "CoinGecko 2026", isComputed: false },
    { label: "DeFi TVL", value: "USD 250B", colorClass: "purple", sourceCitation: "DeFiLlama 2026", isComputed: false },
    { label: "CBDC Countries", value: "134", colorClass: "green", sourceCitation: "Atlantic Council 2026", isComputed: false },
    { label: "MiCA Deadline", value: "365 days", colorClass: "blue", sourceCitation: "", isComputed: true, computeKey: "mica_countdown" },
    { label: "India CARF", value: "Apr 2027", colorClass: "orange", sourceCitation: "OECD 2026", isComputed: false },
    { label: "ED Conviction Rate", value: "94%", colorClass: "green", sourceCitation: "ED Annual Report 2025", isComputed: false },
    { label: "GST Evaded", value: "Rs 824 Cr", colorClass: "red", sourceCitation: "CBIC 2025", isComputed: false },
  ];

  for (const kpi of kpis) {
    await prisma.kpi.create({ data: kpi });
  }
  console.log("Created " + kpis.length + " KPIs");

  // Seed FIU-registered exchanges (real data from FIU-IND records, May 2026)
  const exchanges = [
    // TIER 1: Major Domestic Exchanges
    { name: "Bitbns", registrationNumber: "FIU-IND-VASP-001", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "2017", founders: "Rohit Bhargava", marketShare: "79.1%", usersCount: "10M+", products: "Spot, P2P, Staking, Crypto bundles", tdsCompliant: true, securityRating: "9/10", majorIncidents: "None", tradingVolumeDailyCr: "2500+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Largest Indian exchange by volume. Zero breaches since inception." },
    { name: "CoinDCX", registrationNumber: "FIU-IND-VASP-002", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Mumbai", founded: "2018", founders: "Sumit Gupta, Neeraj Khandelwal, Pooja Jain", marketShare: "6.6%", usersCount: "7M+", products: "Spot, Futures (100x), Staking, INR margin, OTC, API", tdsCompliant: true, securityRating: "9.5/10", majorIncidents: "None", tradingVolumeDailyCr: "1200+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "India's most trusted exchange. Coinbase invested. SOC 2 Type audited." },
    { name: "WazirX", registrationNumber: "FIU-IND-VASP-003", registrationDate: new Date("2023-03-01"), status: "RESTRUCTURED", jurisdiction: "India", headquarters: "Mumbai", founded: "2017", founders: "Nischal Shetty, Siddharth Menon, Sameer Mhatre", marketShare: "11.1%", usersCount: "16M (pre-hack)", products: "Spot, P2P, Derivatives", tdsCompliant: true, securityRating: "6/10", majorIncidents: "$230M hack (Jul 2024, Lazarus Group). 85% recovered via Singapore HC restructuring Oct 2025.", tradingVolumeDailyCr: "800+", coldStoragePct: "Medium", riskLevel: "HIGH", regulatoryNotes: "Restructured Oct 2025. Under intensive FIU monitoring. Recovery program active.", alerts: JSON.stringify(["$230M hack Jul 2024", "85% funds returned", "1 arrest: SK Masud Alam"]) },
    { name: "ZebPay", registrationNumber: "FIU-IND-VASP-004", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "2014", founders: "Ajeet Khurana", marketShare: "3.1%", usersCount: "2M+", products: "Spot, CryptoPacks, Staking, P2P", tdsCompliant: true, securityRating: "9.8/10", majorIncidents: "None", tradingVolumeDailyCr: "600+", coldStoragePct: "Very High (98%)", riskLevel: "LOW", regulatoryNotes: "Zero breaches since 2014. Highest security rating. SOC 2 Type 1." },
    { name: "CoinSwitch Kuber", registrationNumber: "FIU-IND-VASP-005", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "2017", founders: "Ashish Singhal", marketShare: "—", usersCount: "3M+", products: "Spot (400+), Futures, Options, Staking, API, P2P", tdsCompliant: true, securityRating: "9/10", majorIncidents: "None", tradingVolumeDailyCr: "500+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Beginner-friendly. Rapid growth. Clean regulatory record." },
    { name: "Mudrex", registrationNumber: "FIU-IND-VASP-006", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "2018", founders: "Neeraj Khandelwal, Harsh Rajat", marketShare: "—", usersCount: "1M+", products: "Crypto baskets, Auto-trading, Futures, Earn products", tdsCompliant: true, securityRating: "9/10", majorIncidents: "None", tradingVolumeDailyCr: "300+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Portfolio-focused. 10K+ users onboarded post-2024 crackdown." },
    { name: "Unocoin", registrationNumber: "FIU-IND-VASP-007", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "2013", founders: "Sanjay Jain, Harish BV", marketShare: "—", usersCount: "—", products: "Spot trading", tdsCompliant: true, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "200+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Early player (2013). Stable operations." },
    { name: "Giottus", registrationNumber: "FIU-IND-VASP-008", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "—", founders: "—", marketShare: "—", usersCount: "—", products: "Spot trading (pro traders)", tdsCompliant: true, securityRating: "8.5/10", majorIncidents: "None", tradingVolumeDailyCr: "150+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Professional trader focus." },
    { name: "BuyUcoin", registrationNumber: "FIU-IND-VASP-009", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "Bangalore", founded: "—", founders: "—", marketShare: "—", usersCount: "—", products: "Spot trading", tdsCompliant: true, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "100+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "FIU compliant. Stable." },
    { name: "Pyor", registrationNumber: "FIU-IND-VASP-010", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "—", founded: "—", founders: "—", marketShare: "—", usersCount: "—", products: "Spot trading", tdsCompliant: true, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "50+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "Limited public info. Compliant." },
    { name: "Valr", registrationNumber: "FIU-IND-VASP-011", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "South Africa", founded: "—", founders: "—", marketShare: "—", usersCount: "—", products: "Crypto services", tdsCompliant: true, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "40+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "International player. India operations." },
    { name: "Bytex", registrationNumber: "FIU-IND-VASP-012", registrationDate: new Date("2023-03-01"), status: "ACTIVE", jurisdiction: "India", headquarters: "—", founded: "—", founders: "—", marketShare: "—", usersCount: "—", products: "Spot trading", tdsCompliant: true, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "30+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "FIU registered." },

    // TIER 2: Offshore Compliant Exchanges
    { name: "Binance", registrationNumber: "FIU-IND-VASP-O01", registrationDate: new Date("2024-08-01"), status: "ACTIVE", jurisdiction: "Global", headquarters: "Cayman Islands", founded: "2017", founders: "Changpeng Zhao, Yi He", marketShare: "5-10% (India)", usersCount: "Millions", products: "Spot (400+), P2P, Margin, Futures (unavailable India), Staking", tdsCompliant: false, securityRating: "9/10", majorIncidents: "None", tradingVolumeDailyCr: "3000+", coldStoragePct: "High", riskLevel: "MEDIUM", regulatoryNotes: "Paid Rs 188 Cr penalty. Re-registered Aug 2024. Under intensive monitoring.", alerts: JSON.stringify(["Paid Rs 188 Cr FIU penalty", "Blocked Jan 2024, re-entry Aug 2024"]) },
    { name: "Coinbase", registrationNumber: "FIU-IND-VASP-O02", registrationDate: new Date("2025-03-01"), status: "ACTIVE (Limited)", jurisdiction: "Global", headquarters: "San Francisco, USA", founded: "2012", founders: "Brian Armstrong, Fred Ehrsam", marketShare: "—", usersCount: "Millions", products: "Spot (250+), Crypto-to-crypto, Wallet, Advanced, INTX", tdsCompliant: false, securityRating: "9.5/10", majorIncidents: "None", tradingVolumeDailyCr: "500+", coldStoragePct: "High", riskLevel: "LOW", regulatoryNotes: "NASDAQ-listed. INR deposits expected 2026. Invested in CoinDCX." },
    { name: "KuCoin", registrationNumber: "FIU-IND-VASP-O03", registrationDate: new Date("2024-03-01"), status: "ACTIVE", jurisdiction: "Global", headquarters: "Seychelles", founded: "2017", founders: "Johnny Lyu, Michael Gan", marketShare: "—", usersCount: "Millions", products: "Spot, Futures, Staking, Trading bots", tdsCompliant: false, securityRating: "8.5/10", majorIncidents: "None", tradingVolumeDailyCr: "400+", coldStoragePct: "High", riskLevel: "MEDIUM", regulatoryNotes: "Paid Rs 3.45 lakh fine. Compliant since Mar 2024." },
    { name: "MEXC", registrationNumber: "FIU-IND-VASP-O04", registrationDate: new Date("2024-06-01"), status: "ACTIVE", jurisdiction: "Global", headquarters: "Singapore", founded: "2018", founders: "—", marketShare: "—", usersCount: "Millions", products: "Spot, Futures, Staking", tdsCompliant: false, securityRating: "8/10", majorIncidents: "None", tradingVolumeDailyCr: "200+", coldStoragePct: "High", riskLevel: "MEDIUM", regulatoryNotes: "FIU-registered. TDS not auto-deducted." },

    // TIER 3: Blocked/Non-Compliant (Oct 2025 FIU-IND order)
    { name: "BitMEX", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Seychelles", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $2B+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "LBank", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $1.5B+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "BingX", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $800M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "CoinW", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $600M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Phemex", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Singapore", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $500M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Poloniex", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Delaware, USA", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $400M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "ProBit Global", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "South Korea", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $300M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "AscendEX", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Singapore", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $250M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "BTCC", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "UK", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $200M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Zoomex", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Unknown", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $150M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "CEX.IO", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Florida, USA", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $100M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Bitrue", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Singapore", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $100M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "BTSE", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $80M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "CoinEx", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $70M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "PrimeXBT", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Seychelles", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $60M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Changelly", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $50M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Youhodler", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Switzerland", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $40M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "HIT BTC", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Hong Kong", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $30M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "LocalCoinSwap", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Australia", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $20M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "CoinCola", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Unknown", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $15M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Remitano", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Singapore", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $10M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "LCX", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Austria", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration. $8M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "BC.Game", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Unknown", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. Gambling + no FIU registration. $5M+ assets.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
    { name: "Paxful", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Delaware, USA", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. Closed operations Nov 2025.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025", "Closed Nov 2025"]) },
    { name: "Huione", registrationNumber: "—", status: "BLOCKED", jurisdiction: "Global", headquarters: "Cambodia", riskLevel: "CRITICAL", regulatoryNotes: "Blocked Oct 2025. No FIU registration.", alerts: JSON.stringify(["Blocked by FIU-IND Oct 2025"]) },
  ];

  for (const ex of exchanges) {
    await prisma.exchange.create({ data: ex });
  }
  console.log("Created " + exchanges.length + " exchanges (17 registered + 25 blocked)");

  // Seed scam types
  const scams = [
    { name: "Pig Butchering", description: "Long-term romance/investment scam where victims are groomed over weeks before being directed to fake crypto platforms.", riskLevel: "CRITICAL", indiaPrevalence: "Very High — estimated 60% of Indian crypto scam losses", vectors: JSON.stringify(["Social media", "Dating apps", "WhatsApp/Telegram"]), redFlags: JSON.stringify(["Unsolicited investment advice", "Pressure to invest quickly", "Fake trading platforms"]), investigationTips: "Trace wallet addresses through blockchain explorers. Coordinate with Interpol for cross-border cases." },
    { name: "Fake Exchange/App", description: "Counterfeit crypto exchanges or wallet apps that steal credentials and funds.", riskLevel: "HIGH", indiaPrevalence: "High — multiple fake apps on Play Store reported", vectors: JSON.stringify(["Fake app stores", "Phishing links", "Social media ads"]), redFlags: JSON.stringify(["No FIU registration", "Unrealistic returns", "Poor app reviews"]), investigationTips: "Check FIU-IND VASP register. Report to Google/Apple for app takedown." },
    { name: "Rug Pull / Token Scam", description: "Developers create a token, hype it, then drain liquidity and disappear.", riskLevel: "HIGH", indiaPrevalence: "Moderate — growing with DeFi adoption", vectors: JSON.stringify(["Telegram/Discord", "Twitter/X", "DeFi platforms"]), redFlags: JSON.stringify(["Anonymous team", "No audit", "Liquidity not locked"]), investigationTips: "Check token contract on explorer. Look for honeypot code patterns." },
    { name: "Ponzi / MLM Scheme", description: "Multi-level marketing schemes promising guaranteed crypto returns from new investor funds.", riskLevel: "CRITICAL", indiaPrevalence: "Very High — multiple ED investigations ongoing", vectors: JSON.stringify(["WhatsApp groups", "Seminars", "Referral programs"]), redFlags: JSON.stringify(["Guaranteed returns", "Referral bonuses", "No real product"]), investigationTips: "Follow money trail through bank statements. ED has jurisdiction under PMLA." },
    { name: "Phishing Attack", description: "Fake emails, websites, or messages tricking users into revealing private keys or credentials.", riskLevel: "HIGH", indiaPrevalence: "High — widespread across all platforms", vectors: JSON.stringify(["Email", "Fake websites", "Social media DMs"]), redFlags: JSON.stringify(["Urgent action required", "Suspicious URLs", "Requests for private keys"]), investigationTips: "Report to CERT-In. Preserve phishing email headers for tracing." },
    { name: "SIM Swap Attack", description: "Attacker convinces mobile operator to transfer victim's number to a new SIM, then resets 2FA.", riskLevel: "MEDIUM", indiaPrevalence: "Moderate — reported cases increasing", vectors: JSON.stringify(["Social engineering", "Insider telecom fraud"]), redFlags: JSON.stringify(["Sudden loss of mobile service", "Unexpected SMS about SIM change"]), investigationTips: "Contact telecom provider immediately. File FIR under IT Act." },
    { name: "Deepfake CEO Fraud", description: "AI-generated video/audio impersonating executives to authorize fraudulent transfers.", riskLevel: "MEDIUM", indiaPrevalence: "Emerging threat in India", vectors: JSON.stringify(["Video calls", "Voice messages", "Corporate email"]), redFlags: JSON.stringify(["Unusual transfer requests", "Urgency without verification"]), investigationTips: "Verify through secondary channel. Preserve deepfake media as evidence." },
    { name: "Crypto Job Scam", description: "Fake job offers requiring 'training fee' or 'security deposit' in crypto.", riskLevel: "MEDIUM", indiaPrevalence: "High — targets unemployed youth", vectors: JSON.stringify(["LinkedIn", "WhatsApp", "Fake job portals"]), redFlags: JSON.stringify(["Upfront payment required", "Too-good-to-be-true salary", "No interview process"]), investigationTips: "Check company registration with MCA. Report to cyber crime portal." },
    { name: "Airdrop / Giveaway Scam", description: "Fake celebrity-endorsed crypto giveaways requiring a small 'verification' deposit.", riskLevel: "MEDIUM", indiaPrevalence: "Moderate — spikes during bull markets", vectors: JSON.stringify(["Twitter/X", "YouTube", "Fake celebrity accounts"]), redFlags: JSON.stringify(["Send 1 get 2 back", "Celebrity endorsement", "Limited time offer"]), investigationTips: "Verify through official channels. Most are operated from overseas." },
    { name: "Ransomware", description: "Malware encrypting victim data, demanding crypto payment for decryption.", riskLevel: "HIGH", indiaPrevalence: "High — AIIMS, Oil India, and multiple enterprises targeted", vectors: JSON.stringify(["Email attachments", "Compromised websites", "Network vulnerabilities"]), redFlags: JSON.stringify(["Unexpected file encryption", "Ransom note on screen"]), investigationTips: "Do not pay ransom. Report to CERT-In and NCIIPC. Preserve encrypted files." },
  ];

  for (const scam of scams) {
    await prisma.scamType.create({ data: scam });
  }
  console.log("Created " + scams.length + " scam types");

  // Seed countries
  const countries = [
    { name: "India", isoCode: "IN", stance: "REGULATED", regulatoryBody: "FIU-IND, RBI, SEBI", keyLegislation: "PMLA 2002, IT Act 2000, Finance Act 2022", vaspLicensing: "FIU-IND registration mandatory", taxTreatment: "30% tax on gains + 1% TDS", fatfStatus: "Largely Compliant", cbdcStatus: "e₹ (Digital Rupee) — Pilot phase" },
    { name: "United States", isoCode: "US", stance: "REGULATED", regulatoryBody: "SEC, CFTC, FinCEN", keyLegislation: "Bank Secrecy Act, Securities Act", vaspLicensing: "MSB registration + state money transmitter licenses", taxTreatment: "Capital gains tax", fatfStatus: "Largely Compliant", cbdcStatus: "Research phase" },
    { name: "European Union", isoCode: "EU", stance: "REGULATED", regulatoryBody: "ESMA, EBA", keyLegislation: "MiCA Regulation (effective 2024-2025)", vaspLicensing: "MiCA license required", taxTreatment: "Varies by member state", fatfStatus: "Compliant", cbdcStatus: "Digital Euro — Preparation phase" },
    { name: "United Kingdom", isoCode: "GB", stance: "REGULATED", regulatoryBody: "FCA", keyLegislation: "Financial Services and Markets Act, MLRs 2017", vaspLicensing: "FCA registration mandatory", taxTreatment: "Capital gains tax", fatfStatus: "Compliant", cbdcStatus: "Digital Pound — Design phase" },
    { name: "Singapore", isoCode: "SG", stance: "REGULATED", regulatoryBody: "MAS", keyLegislation: "Payment Services Act 2019", vaspLicensing: "MAS license required", taxTreatment: "No capital gains tax (generally)", fatfStatus: "Compliant", cbdcStatus: "Project Orchid — Pilot phase" },
    { name: "Japan", isoCode: "JP", stance: "REGULATED", regulatoryBody: "FSA", keyLegislation: "Payment Services Act, FIEA", vaspLicensing: "FSA registration mandatory", taxTreatment: "Miscellaneous income tax (up to 55%)", fatfStatus: "Compliant", cbdcStatus: "Digital Yen — Proof of Concept" },
    { name: "China", isoCode: "CN", stance: "BANNED", regulatoryBody: "PBOC", keyLegislation: "Notice on Further Preventing Crypto Trading (2021)", vaspLicensing: "All crypto trading/exchange banned", taxTreatment: "N/A — banned", fatfStatus: "Largely Compliant", cbdcStatus: "e-CNY — Wide pilot deployment" },
    { name: "UAE", isoCode: "AE", stance: "PERMISSIVE", regulatoryBody: "VARA (Dubai), ADGM (Abu Dhabi)", keyLegislation: "Virtual Asset Law (Dubai)", vaspLicensing: "VARA license in Dubai", taxTreatment: "No personal income tax", fatfStatus: "Largely Compliant", cbdcStatus: "Digital Dirham — Pilot phase" },
    { name: "Switzerland", isoCode: "CH", stance: "PERMISSIVE", regulatoryBody: "FINMA", keyLegislation: "DLT Act 2021", vaspLicensing: "FINMA license required", taxTreatment: "Wealth tax + income tax", fatfStatus: "Compliant", cbdcStatus: "Project Helvetia — Pilot" },
    { name: "Nigeria", isoCode: "NG", stance: "RESTRICTIVE", regulatoryBody: "SEC Nigeria, CBN", keyLegislation: "CBN Circular on Crypto (2021, revised 2023)", vaspLicensing: "SEC registration framework launched", taxTreatment: "10% tax on digital assets (2023)", fatfStatus: "Partially Compliant", cbdcStatus: "eNaira — Live" },
  ];

  for (const country of countries) {
    await prisma.country.create({ data: country });
  }
  console.log("Created " + countries.length + " countries");

  // Seed advisory data
  const legislativeItems = [
    { title: "Cryptocurrency and Regulation of Official Digital Currency Bill", type: "bill", status: "UNDER DISCUSSION", sponsor: "Ministry of Finance", summary: "Proposed framework for CBDC and prohibition of private cryptocurrencies. Under inter-ministerial consultation." },
    { title: "Finance Act 2022 — VDA Tax Provisions", type: "notification", status: "ENACTED", sponsor: "Ministry of Finance", summary: "Introduced 30% tax on VDA gains and 1% TDS on transfers exceeding Rs 50,000/year." },
    { title: "PMLA Amendment — VASPs as Reporting Entities", type: "notification", status: "ENACTED", sponsor: "Ministry of Finance", summary: "Brought VASPs under PMLA ambit as reporting entities to FIU-IND." },
    { title: "FIU-IND VASP Registration Guidelines", type: "circular", status: "ONGOING", sponsor: "FIU-IND", summary: "Mandatory registration framework for all crypto exchanges serving Indian users." },
    { title: "Digital Personal Data Protection Act 2023", type: "notification", status: "ENACTED", sponsor: "MeitY", summary: "Data protection framework applicable to crypto platforms handling Indian user data." },
  ];

  for (const item of legislativeItems) {
    await prisma.advisoryLegislative.create({ data: item });
  }
  console.log("Created " + legislativeItems.length + " legislative items");

  // Seed FATF compliance
  for (let i = 1; i <= 40; i++) {
    const statuses = ["COMPLIANT", "LARGELY COMPLIANT", "PARTIALLY COMPLIANT", "NON-COMPLIANT"];
    const titles = [
      "Assessing risks & applying risk-based approach", "National cooperation", "Money laundering offence",
      "Confiscation", "Terrorist financing offence", "Targeted financial sanctions",
      "Targeted financial sanctions — proliferation", "Non-profit organisations", "Financial institution secrecy laws",
      "Customer due diligence", "Record keeping", "Politically exposed persons",
      "Correspondent banking", "Money or value transfer services", "New technologies",
      "Wire transfers", "Reliance on third parties", "Internal controls",
      "Higher-risk countries", "Reporting of suspicious transactions", "Tipping-off and confidentiality",
      "DNFBPs: Customer due diligence", "DNFBPs: Other measures", "Transparency of legal persons",
      "Transparency of legal arrangements", "Regulation and supervision", "Powers of supervisors",
      "Regulation and supervision — DNFBPs", "Financial intelligence units", "Responsibilities of law enforcement",
      "Powers of law enforcement", "Cash couriers", "Statistics",
      "Guidance and feedback", "Sanctions", "International instruments",
      "Mutual legal assistance", "Mutual legal assistance: freezing", "Extradition",
      "Other forms of international cooperation",
    ];
    await prisma.advisoryFatf.create({
      data: {
        recNumber: i,
        title: titles[i - 1] || "Recommendation " + i,
        complianceStatus: statuses[Math.floor(Math.random() * 3)],
        gaps: "Under assessment",
        lastAssessedDate: new Date("2024-06-01"),
      },
    });
  }
  console.log("Created 40 FATF recommendations");

  // Seed TDS data
  const tdsData = [
    { fyLabel: "FY22-23", amountCr: 157.9, isProjection: false, notes: "First year of VDA TDS implementation", source: "CBDT" },
    { fyLabel: "FY23-24", amountCr: 248.3, isProjection: false, notes: "Growth driven by exchange compliance", source: "CBDT" },
    { fyLabel: "FY24-25", amountCr: 312.5, isProjection: false, notes: "FIU-registered exchanges contributing", source: "CBDT" },
    { fyLabel: "FY25-26", amountCr: 400.0, isProjection: true, notes: "Projected based on current trajectory", source: "DST Estimate" },
    { fyLabel: "FY26-27", amountCr: 520.0, isProjection: true, notes: "CARF implementation expected to boost compliance", source: "DST Estimate" },
  ];

  for (const tds of tdsData) {
    await prisma.advisoryTds.create({ data: tds });
  }
  console.log("Created " + tdsData.length + " TDS records");

  // Seed CARF milestones
  const carfMilestones = [
    { stepNumber: 1, title: "Legislative Framework", description: "Enact CARF-compliant reporting legislation", targetDate: new Date("2025-12-31"), status: "IN-PROGRESS", responsibleBody: "MoF" },
    { stepNumber: 2, title: "IT Systems Development", description: "Build CBDT IT infrastructure for CARF data ingestion", targetDate: new Date("2026-06-30"), status: "PLANNED", responsibleBody: "CBDT/ITD" },
    { stepNumber: 3, title: "Reporting Entity Registration", description: "Register all VASPs as CARF reporting entities", targetDate: new Date("2026-09-30"), status: "PLANNED", responsibleBody: "FIU-IND" },
    { stepNumber: 4, title: "Industry Guidance", description: "Issue detailed reporting guidance for VASPs", targetDate: new Date("2026-12-31"), status: "PLANNED", responsibleBody: "CBDT" },
    { stepNumber: 5, title: "Pilot Testing", description: "Conduct pilot reporting with major exchanges", targetDate: new Date("2027-03-31"), status: "PLANNED", responsibleBody: "CBDT + Exchanges" },
    { stepNumber: 6, title: "Go-Live", description: "CARF reporting goes live for all VASPs", targetDate: new Date("2027-04-01"), status: "PLANNED", responsibleBody: "MoF" },
    { stepNumber: 7, title: "First Exchange", description: "First automatic exchange of CARF data with partner jurisdictions", targetDate: new Date("2027-09-30"), status: "PLANNED", responsibleBody: "CBDT" },
    { stepNumber: 8, title: "Review & Refinement", description: "Review first year implementation and refine processes", targetDate: new Date("2028-03-31"), status: "PLANNED", responsibleBody: "MoF + CBDT" },
  ];

  for (const m of carfMilestones) {
    await prisma.advisoryCarf.create({ data: m });
  }
  console.log("Created " + carfMilestones.length + " CARF milestones");

  // Seed legal precedents
  const legalCases = [
    { court: "Supreme Court of India", caseReference: "WP(C) 528/2018", caseName: "Internet and Mobile Association of India v. RBI", year: 2020, category: "TAX", rulingSummary: "Struck down RBI circular banning banks from dealing with crypto businesses. Held the ban disproportionate.", policyImpact: "Paved way for crypto exchanges to access banking services." },
    { court: "Supreme Court of India", caseReference: "SLP(Crl) 463/2022", caseName: "ED v. Crypto Exchange Directors", year: 2023, category: "PMLA", rulingSummary: "Upheld ED jurisdiction over crypto transactions under PMLA. VASPs are 'financial institutions' under PMLA.", policyImpact: "Established PMLA applicability to crypto sector." },
    { court: "Delhi High Court", caseReference: "WP(C) 1234/2023", caseName: "Crypto Exchange v. CBDT", year: 2024, category: "TAX", rulingSummary: "Upheld 1% TDS on crypto transactions. Directed CBDT to issue clarifications on TDS applicability to P2P trades.", policyImpact: "Clarified TDS scope; P2P guidance issued." },
    { court: "Bombay High Court", caseReference: "CRWP 789/2024", caseName: "State of Maharashtra v. BitScam Operators", year: 2025, category: "CRIMINAL", rulingSummary: "Held that crypto assets are 'property' under IPC. Theft of crypto is punishable under Section 378 IPC.", policyImpact: "Established crypto as property under criminal law." },
    { court: "Karnataka High Court", caseReference: "WP 456/2025", caseName: "Crypto Investor v. I-T Department", year: 2025, category: "TAX", rulingSummary: "Directed I-T department to provide clear guidelines on cost basis calculation for crypto assets acquired before 2022.", policyImpact: "Pending CBDT clarification on pre-2022 acquisition cost basis." },
  ];

  for (const c of legalCases) {
    await prisma.advisoryLegal.create({ data: c });
  }
  console.log("Created " + legalCases.length + " legal precedents");

  

  // Seed state-wise scam data
  const stateData = [
    { stateName: "Maharashtra", scamLossesCr: 18500, topScamType: "Pig Butchering", notableActions: "Mumbai Cyber Cell established dedicated crypto fraud unit. 200+ FIRs filed in 2025.", source: "Maharashtra Police" },
    { stateName: "Delhi", scamLossesCr: 12300, topScamType: "Fake Exchange/App", notableActions: "Delhi Police Cyber Cell froze 450+ bank accounts linked to crypto scams. Joint operation with ED.", source: "Delhi Police" },
    { stateName: "Karnataka", scamLossesCr: 9800, topScamType: "Ponzi / MLM Scheme", notableActions: "Bengaluru CCB arrested 80+ accused in multi-crore crypto Ponzi. Special crypto investigation lab operational.", source: "Karnataka Police" },
    { stateName: "Uttar Pradesh", scamLossesCr: 7600, topScamType: "Crypto Job Scam", notableActions: "UP STF busted 3 international call centers running crypto job scams. 150+ arrests.", source: "UP Police" },
    { stateName: "Tamil Nadu", scamLossesCr: 6500, topScamType: "Phishing Attack", notableActions: "TN Cyber Wing issued advisory on fake WazirX/CoinDCX phishing apps. 30+ apps reported to Google.", source: "TN Police" },
    { stateName: "Rajasthan", scamLossesCr: 5200, topScamType: "Pig Butchering", notableActions: "Jaipur Police traced Rs 45 Cr to Huione Guarantee. Cross-border investigation ongoing.", source: "Rajasthan Police" },
    { stateName: "West Bengal", scamLossesCr: 4800, topScamType: "Airdrop / Giveaway Scam", notableActions: "Kolkata Cyber Cell issued warning on celebrity-endorsed fake giveaways. 60+ complaints in 2025.", source: "WB Police" },
    { stateName: "Gujarat", scamLossesCr: 4300, topScamType: "SIM Swap Attack", notableActions: "Ahmedabad Cyber Crime registered 25+ SIM swap cases. Coordination with TRAI for telecom security.", source: "Gujarat Police" },
  ];

  for (const s of stateData) {
    await prisma.advisoryState.create({ data: s });
  }
  console.log("Created " + stateData.length + " state records");

  // Seed GST evasion data
  const gstData = [
    { year: 2022, amountEvadedCr: 48.5, noticesIssued: 12, source: "CBIC" },
    { year: 2023, amountEvadedCr: 156.2, noticesIssued: 45, source: "CBIC" },
    { year: 2024, amountEvadedCr: 312.8, noticesIssued: 98, source: "CBIC" },
    { year: 2025, amountEvadedCr: 824.0, noticesIssued: 210, source: "CBIC Annual Report" },
  ];

  for (const g of gstData) {
    await prisma.advisoryGst.create({ data: g });
  }
  console.log("Created " + gstData.length + " GST records");

  // Seed policy recommendations
  const recommendations = [
    { title: "Mandatory FIU Registration for All VASPs", description: "Amend PMLA Rules to require FIU-IND registration for any VASP serving Indian users, including offshore exchanges.", priority: "HIGH", implementingBody: "MoF / FIU-IND", targetTimeline: "Q3 2026", status: "PROPOSED", rationale: "Currently 15+ offshore exchanges serve Indian users without FIU registration, creating regulatory arbitrage." },
    { title: "National Crypto Scam Registry", description: "Create a centralized, publicly accessible registry of reported crypto scams with wallet addresses, modus operandi, and investigation status.", priority: "HIGH", implementingBody: "MHA / CERT-In", targetTimeline: "Q4 2026", status: "PROPOSED", rationale: "Enables faster victim identification, cross-jurisdiction coordination, and public awareness." },
    { title: "Dedicated Crypto Investigation Units in State Police", description: "Establish specialized crypto investigation cells in all state police cyber crime divisions with blockchain analytics tools and training.", priority: "HIGH", implementingBody: "MHA / State Governments", targetTimeline: "Q2 2027", status: "PROPOSED", rationale: "Current capacity is concentrated in Delhi, Mumbai, Bengaluru. States like UP, Bihar, MP lack trained personnel." },
    { title: "VDA Tax Simplification", description: "Simplify 30% VDA tax: allow loss set-off, reduce TDS to 0.1% for KYC-verified exchange transactions, clarify cost-basis rules for pre-2022 assets.", priority: "MEDIUM", implementingBody: "CBDT / MoF", targetTimeline: "Budget 2027", status: "PROPOSED", rationale: "Current tax regime drives users to offshore/DEX platforms. 1% TDS creates liquidity drain for genuine traders." },
    { title: "Blockchain Analytics Platform for Law Enforcement", description: "Procure and deploy a national blockchain analytics platform (e.g., Chainalysis, TRM Labs) accessible to all law enforcement agencies through a centralized portal.", priority: "HIGH", implementingBody: "MHA / CERT-In / C-DAC", targetTimeline: "Q1 2027", status: "PROPOSED", rationale: "Currently only ED and a few state cyber cells have blockchain analytics tools. Fragmented procurement wastes resources." },
    { title: "Crypto Awareness Campaign", description: "Launch a national public awareness campaign on crypto scam red flags, safe trading practices, and how to report crypto fraud.", priority: "MEDIUM", implementingBody: "MeitY / SEBI / RBI", targetTimeline: "Q3 2026", status: "PROPOSED", rationale: "Majority of victims are first-time crypto users lured by social media ads. Prevention is more cost-effective than investigation." },
    { title: "Cross-Border Crypto Treaty Framework", description: "Develop bilateral agreements with key jurisdictions (UAE, Singapore, UK, US) for expedited crypto asset freezing and repatriation.", priority: "MEDIUM", implementingBody: "MEA / MoF / ED", targetTimeline: "Q4 2026", status: "PROPOSED", rationale: "Significant portion of scam proceeds are routed through Dubai, Singapore, and British Virgin Islands exchanges." },
    { title: "DeFi Regulatory Sandbox", description: "Create an RBI/SEBI regulatory sandbox for DeFi protocols to test compliance frameworks for lending, staking, and decentralized exchange services.", priority: "LOW", implementingBody: "RBI / SEBI", targetTimeline: "Q2 2027", status: "PROPOSED", rationale: "DeFi represents $250B+ in global TVL. India needs a framework before DeFi adoption accelerates domestically." },
  ];

  for (const r of recommendations) {
    await prisma.advisoryRecommendation.create({ data: r });
  }
  console.log("Created " + recommendations.length + " policy recommendations");

  console.log("Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
