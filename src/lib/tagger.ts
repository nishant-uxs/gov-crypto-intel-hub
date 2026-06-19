/**
 * Keyword-based crypto news tagger.
 * Tags news items into categories based on title/summary keywords.
 * Used as a reliable fallback when no AI API key is available,
 * and also to determine if a news item is crypto-related at all.
 */

const TAG_KEYWORDS: Record<string, string[]> = {
  CRYPTO_SCAM: [
    "crypto scam", "crypto fraud", "ponzi scheme", "rug pull", "pig butchering",
    "crypto theft", "crypto hack", "exchange hack", "wallet hack", "phishing crypto",
    "fake exchange", "fake crypto", "crypto arrest", "crypto seizure", "money laundering crypto",
    "scam token", "pump and dump", "pump-and-dump", "exit scam", "crypto heist",
    "ransomware", "darknet", "dark web", "mixer", "tornado cash",
    "crypto crime", "crypto criminal", "stolen crypto", "stolen bitcoin",
    "bitconnect", "onecoin", "crypto ponzi", "fraudulent ico",
    "sim swap", "deepfake", "crypto job scam", "airdrop scam", "giveaway scam",
    "lazarus group", "north korea hack", "dprk", "crypto laundering",
  ],
  SCAM: [
    "scam", "fraud", "fraudulent", "swindle", "con artist", "theft",
    "hack ", "hacked", "hacking", "breach", "exploit", "vulnerability",
    "stolen funds", "illicit", "arrest", "seizure", "confiscated",
    "cybercrime", "cyber crime", "investigation", "indictment",
  ],
  POLICY: [
    "regulation", "regulatory", "policy", "legislation", "bill",
    "law ", "legal", "compliance framework", "government", "ministry",
    "parliament", "congress", "senate", "sec ", "cftc", "fca",
    "rbi", "sebi", "fiu", "fatf", "mica", "cbdc", "digital rupee",
    "digital dollar", "digital euro", "digital yuan", "central bank digital",
    "vasp", "travel rule", "aml", "kyc", "know your customer",
    "anti-money laundering", "sanctions", "ban crypto", "crypto ban",
    "crypto regulation", "crypto law", "crypto policy", "crypto tax",
    "tds crypto", "vda tax", "crypto framework", "stablecoin regulation",
    "crypto licensing", "licensing framework",
  ],
  ENFORCEMENT: [
    "enforcement", "fine ", "fined", "penalty", "penalized",
    "crackdown", "clampdown", "shutdown", "blocked", "compliance order",
    "cease and desist", "ed ", "enforcement directorate",
    "prosecution", "convicted", "sentenced", "court order", "lawsuit",
    "sec charges", "sec sues", "cftc charges", "doj ", "fbi ",
    "interpol", "europol", "arrested", "detained",
  ],
  COMPLIANCE: [
    "compliance", "audit", "reporting", "carf", "oecd",
    "tax reporting", "disclosure", "transparency", "due diligence",
    "risk assessment", "monitoring", "surveillance", "compliant",
  ],
  MARKET: [
    "bitcoin price", "btc price", "ethereum price", "eth price",
    "crypto market", "market cap", "trading volume", "bull run",
    "bear market", "all-time high", "ath", "rally", "crash",
    "correction", "pullback", "breakout", "resistance", "support level",
    "crypto etf", "bitcoin etf", "spot etf", "futures",
    "crypto exchange", "trading", "liquidity", "whale",
    "price prediction", "price analysis", "market analysis",
    "institutional", "adoption", "inflow", "outflow",
    "halving", "mining", "hash rate", "hashrate",
    "stablecoin", "usdt", "usdc", "tether",
    "cardano", "solana", "xrp", "ripple", "dogecoin", "shiba",
    "altcoin", "memecoin", "meme coin",
  ],
  INNOVATION: [
    "innovation", "startup", "launch", "partnership", "integration",
    "protocol", "upgrade", "update", "development", "roadmap",
    "mainnet", "testnet", "layer 2", "layer-2", "l2",
    "scaling", "interoperability", "bridge", "cross-chain",
    "smart contract", "dapp", "decentralized app",
    "tokenization", "real world asset", "rwa",
    "ai crypto", "artificial intelligence blockchain",
    "gaming crypto", "gamefi", "play-to-earn",
    "metaverse", "virtual world",
    "cbdc pilot", "digital currency pilot",
  ],
  BLOCKCHAIN: [
    "blockchain", "distributed ledger", "dlt", "defi",
    "decentralized finance", "nft", "non-fungible",
    "web3", "web 3", "dao", "decentralized autonomous",
    "consensus", "proof of stake", "proof of work",
    "pos ", "pow ", "validator", "staking",
    "ethereum", "solidity", "smart contract",
    "token", "tokenomics", "ico", "ido", "ieo",
    "cryptocurrency", "crypto currency", "digital asset",
    "virtual asset", "bitcoin", "btc", "eth ",
    "crypto", "altcoin", "defi protocol",
    "yield farming", "liquidity pool", "amm",
    "decentralized exchange", "dex", "cex",
    "wallet", "private key", "public key", "seed phrase",
    "cold storage", "hot wallet",
  ],
};

// Keywords that indicate the article is NOT about crypto/blockchain
const NON_CRYPTO_INDICATORS = [
  "electric aviation", "aviation company", "football", "soccer",
  "baseball", "basketball", "olympics", "oscar", "grammy",
  "cooking", "recipe", "weather forecast", "celebrity gossip",
  "fashion week", "movie review", "tv show", "reality tv",
  "real estate market", "housing market", "car review",
  "travel destination", "tourism", "hotel review",
];

/**
 * Determine the tag for a news item based on its title and summary.
 * Returns the best matching tag, or empty string if no match.
 */
export function classifyByKeywords(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  // Check if this is clearly not crypto-related
  for (const indicator of NON_CRYPTO_INDICATORS) {
    if (text.includes(indicator)) {
      // Only exclude if there's no crypto keyword present at all
      const hasCryptoKeyword = TAG_KEYWORDS.BLOCKCHAIN.some(kw => text.includes(kw.trim()));
      if (!hasCryptoKeyword) return "";
    }
  }

  // Score each tag
  const scores: Record<string, number> = {};

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const kw = keyword.trim().toLowerCase();
      if (text.includes(kw)) {
        // Longer keywords get higher scores (more specific match)
        score += kw.length;
      }
    }
    if (score > 0) scores[tag] = score;
  }

  if (Object.keys(scores).length === 0) return "";

  // CRYPTO_SCAM takes priority if it scores well
  if (scores.CRYPTO_SCAM && scores.CRYPTO_SCAM > 10) return "CRYPTO_SCAM";

  // SCAM category: only if there's also a crypto indicator
  if (scores.SCAM && !scores.BLOCKCHAIN && !scores.MARKET && !scores.POLICY) {
    // Generic scam without crypto context — skip
    return "";
  }

  // Return the highest scoring tag
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

/**
 * Check if a news item is related to crypto/blockchain.
 */
export function isCryptoRelated(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return TAG_KEYWORDS.BLOCKCHAIN.some(kw => text.includes(kw.trim()));
}
