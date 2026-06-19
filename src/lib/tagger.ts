/**
 * Keyword-based crypto news tagger — STRICT VERSION.
 *
 * DESIGN PRINCIPLE: An article must contain at least one CORE CRYPTO keyword
 * before it can be tagged at all. Generic finance/business/legal words alone
 * (e.g. "trading", "compliance", "enforcement") are NOT enough.
 *
 * This prevents stock-market stories, Bollywood box-office numbers, and
 * general business news from leaking into the feed.
 */

// ──────────────────────────────────────────────────────────────────────
// 1. CORE CRYPTO IDENTIFIERS — at least ONE must appear in the text
//    for the article to be considered crypto-related at all.
// ──────────────────────────────────────────────────────────────────────
const CORE_CRYPTO_KEYWORDS = [
  // Coins & tokens
  "bitcoin", "btc", "ethereum", "eth", "solana", "sol ",
  "cardano", "ada ", "xrp", "ripple", "dogecoin", "doge",
  "shiba", "litecoin", "ltc", "polkadot", "dot ",
  "avalanche", "avax", "polygon", "matic", "chainlink", "link ",
  "uniswap", "aave", "maker", "compound", "bnb", "tron", "trx",
  "monero", "zcash", "toncoin", "ton ",
  // Stablecoins
  "usdt", "usdc", "tether", "dai ", "stablecoin",
  // Generic crypto terms
  "crypto", "cryptocurrency", "cryptocurrencies",
  "blockchain", "block chain",
  "defi", "decentralized finance",
  "nft", "non-fungible token",
  "web3", "web 3.0",
  "dao ", "decentralized autonomous",
  "dapp", "decentralized app",
  "smart contract",
  "digital asset", "virtual asset", "virtual digital asset", "vda",
  "cbdc", "digital rupee", "digital dollar", "digital euro", "digital yuan",
  "e-rupee",
  // Exchanges
  "coinbase", "binance", "kraken", "coindesk", "cointelegraph",
  "wazirx", "coindcx", "zebpay", "coinswitch", "mudrex",
  "kucoin", "bitfinex", "gemini", "bybit", "okx",
  "unocoin", "giottus", "buyucoin",
  // DeFi / protocols
  "yield farming", "liquidity pool", "amm",
  "dex", "decentralized exchange",
  "proof of stake", "proof of work", "pos ", "pow ",
  "validator", "staking", "mining", "miner",
  "hash rate", "hashrate", "halving",
  // Wallets & tech
  "metamask", "ledger", "cold wallet", "hot wallet",
  "private key", "seed phrase", "wallet address",
  "layer 2", "layer-2", "l2 ",
  "rollup", "zk-proof", "zero knowledge",
  // Crypto-specific orgs / regulations
  "fiu-ind", "fiu ", "vasp",
  "fatf", "mica ", "carf",
  "sec crypto", "cftc crypto",
  // Crypto scam terms (these alone are enough)
  "rug pull", "pig butchering", "crypto scam", "crypto fraud",
  "crypto hack", "crypto theft", "crypto crime",
  "tornado cash", "lazarus group",
  "ico ", "ido ", "ieo ",
  "tokenomics", "tokenization", "tokenised", "tokenized",
  "airdrop",
  "memecoin", "meme coin",
  "bitcoin etf", "crypto etf", "spot etf",
];

// ──────────────────────────────────────────────────────────────────────
// 2. TAG-SPECIFIC KEYWORDS — used to pick the right category AFTER
//    we've confirmed the article is crypto-related.
// ──────────────────────────────────────────────────────────────────────
const TAG_KEYWORDS: Record<string, string[]> = {
  CRYPTO_SCAM: [
    "crypto scam", "crypto fraud", "ponzi scheme", "rug pull", "pig butchering",
    "crypto theft", "crypto hack", "exchange hack", "wallet hack",
    "fake exchange", "fake crypto", "scam token", "pump and dump",
    "exit scam", "crypto heist", "ransomware", "darknet", "dark web",
    "tornado cash", "crypto crime", "crypto criminal",
    "stolen crypto", "stolen bitcoin", "stolen funds",
    "crypto ponzi", "fraudulent ico",
    "sim swap crypto", "airdrop scam", "giveaway scam",
    "lazarus group", "north korea hack", "dprk",
    "crypto laundering", "money laundering crypto",
    "phishing crypto", "phishing attack",
    "crypto arrest", "crypto seizure",
  ],
  SCAM: [
    "scam", "fraud", "fraudulent", "swindle",
    "hack", "hacked", "hacking", "breach", "exploit",
    "stolen", "illicit", "seizure", "confiscated",
    "cybercrime", "cyber crime",
  ],
  ENFORCEMENT: [
    "enforcement", "crackdown", "clampdown", "shutdown",
    "sec charges", "sec sues", "cftc charges",
    "enforcement directorate", "ed raid",
    "prosecution", "convicted", "sentenced", "court order",
    "fined", "penalty", "penalized",
    "interpol", "europol",
    "compliance order", "cease and desist",
    "blocked exchange", "banned exchange",
  ],
  POLICY: [
    "crypto regulation", "crypto law", "crypto policy", "crypto tax",
    "crypto ban", "ban crypto", "crypto framework",
    "stablecoin regulation", "crypto licensing",
    "vda tax", "tds crypto",
    "cbdc", "digital rupee", "digital dollar", "digital euro",
    "mica regulation", "mica ", "carf",
    "fatf", "travel rule",
    "vasp registration", "vasp",
    "aml crypto", "kyc crypto",
    "virtual asset regulation",
    "crypto bill", "crypto legislation",
  ],
  COMPLIANCE: [
    "crypto compliance", "vasp compliance",
    "carf reporting", "crypto reporting",
    "crypto audit", "exchange audit",
    "fiu registration", "fiu compliance",
    "crypto disclosure", "crypto transparency",
    "aml compliance", "kyc compliance",
  ],
  MARKET: [
    "bitcoin price", "btc price", "ethereum price", "eth price",
    "crypto market", "crypto trading", "crypto exchange",
    "market cap", "bull run", "bear market",
    "all-time high", "ath",
    "bitcoin etf", "crypto etf", "spot etf",
    "crypto rally", "crypto crash",
    "bitcoin halving", "halving",
    "whale", "crypto whale",
    "inflow", "outflow",
    "price prediction", "price analysis",
    "altcoin", "memecoin", "meme coin",
    "stablecoin", "usdt", "usdc", "tether",
    "cardano", "solana", "xrp", "ripple", "dogecoin",
    "crypto adoption", "institutional adoption",
    "trading volume",
  ],
  INNOVATION: [
    "mainnet", "testnet", "layer 2", "layer-2",
    "scaling", "interoperability", "cross-chain", "bridge",
    "smart contract", "dapp", "decentralized app",
    "tokenization", "real world asset", "rwa",
    "gamefi", "play-to-earn",
    "metaverse",
    "cbdc pilot", "digital currency pilot",
    "protocol upgrade", "protocol launch",
    "blockchain startup",
    "defi protocol",
    "zk-proof", "zero knowledge",
    "rollup",
  ],
  BLOCKCHAIN: [
    "blockchain", "distributed ledger", "dlt",
    "defi", "decentralized finance",
    "nft", "non-fungible",
    "web3", "web 3",
    "dao", "decentralized autonomous",
    "proof of stake", "proof of work",
    "validator", "staking",
    "ethereum", "solidity",
    "cryptocurrency", "digital asset", "virtual asset",
    "bitcoin", "btc",
    "yield farming", "liquidity pool", "amm",
    "dex", "decentralized exchange",
    "cold storage", "hot wallet", "cold wallet",
    "mining", "miner", "hash rate",
    "crypto",
    "tokenomics",
  ],
};

// ──────────────────────────────────────────────────────────────────────
// 3. PUBLIC API
// ──────────────────────────────────────────────────────────────────────

/**
 * Returns true only if the article clearly relates to crypto / blockchain.
 */
export function isCryptoRelated(title: string, summary: string): boolean {
  const text = ` ${title} ${summary} `.toLowerCase();
  return CORE_CRYPTO_KEYWORDS.some((kw) => text.includes(kw.trim()));
}

/**
 * Classify a news item. Returns a tag string, or "" if the article is
 * not crypto-related (and should be skipped / suppressed).
 */
export function classifyByKeywords(title: string, summary: string): string {
  const text = ` ${title} ${summary} `.toLowerCase();

  // ── Gate: article MUST mention crypto / blockchain ──
  if (!isCryptoRelated(title, summary)) {
    return "";
  }

  // ── Score every tag ──
  const scores: Record<string, number> = {};

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const kw = keyword.trim().toLowerCase();
      if (text.includes(kw)) {
        score += kw.length; // longer match = more specific
      }
    }
    if (score > 0) scores[tag] = score;
  }

  // No tag keywords matched → still crypto-related, default BLOCKCHAIN
  if (Object.keys(scores).length === 0) return "BLOCKCHAIN";

  // CRYPTO_SCAM takes priority if it scored well
  if (scores.CRYPTO_SCAM && scores.CRYPTO_SCAM > 10) return "CRYPTO_SCAM";

  // Return the highest-scoring tag
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}
