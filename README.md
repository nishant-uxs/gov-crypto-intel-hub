# 🛡️ Government Crypto Intelligence Hub

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript">
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?logo=prisma">
  <img src="https://img.shields.io/badge/Tailwind-3.0-38BDF8?logo=tailwindcss">
  <img src="https://img.shields.io/badge/Chart.js-4.0-FF6384?logo=chartdotjs">
  <img src="https://img.shields.io/badge/Claude-AI-7B61FF?logo=anthropic">
  <img src="https://img.shields.io/badge/build-passing-brightgreen">
  <img src="https://img.shields.io/badge/pages-29-blue">
  <img src="https://img.shields.io/badge/classification-OFFICIAL%20USE%20ONLY-red">
</p>

<p align="center">
  <b>A comprehensive, real-time cryptocurrency intelligence dashboard for monitoring regulatory developments, scam patterns, FIU-registered exchanges, and policy frameworks — with a primary focus on India.</b>
</p>

<p align="center">
  <sub>Built for <b>Digital South Trust</b> • Blockchain Centre of Excellence, Vellore</sub>
</p>

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Browser["🖥️ Browser"]
        UI["React Components<br/>8 Tabs + Admin Panel"]
    end

    subgraph NextJS["⚡ Next.js 14 App Router"]
        Pages["29 Pages<br/>8 Public + 15 Admin + APIs"]
        API["13 REST API Routes"]
        Auth["NextAuth.js<br/>JWT Sessions"]
    end

    subgraph DataLayer["🗄️ Data Layer"]
        Prisma["Prisma ORM<br/>Singleton Client"]
        SQLite[("SQLite<br/>16 Tables<br/>dev.db")]
    end

    subgraph Ingestion["📡 Live Ingestion Pipeline"]
        RSS["8 RSS Sources<br/>PIB • CoinDesk • The Block<br/>Cointelegraph • FIU • RBI • SEBI"]
        Claude["Claude Haiku 4<br/>Auto-Tagging"]
        PDF["jsPDF Export<br/>Govt Formatting"]
    end

    UI -->|"fetch('/api/...')"| API
    API --> Prisma
    Prisma --> SQLite
    RSS -->|"rss-parser"| Prisma
    Claude -->|"Tag: POLICY|ENFORCEMENT|SCAM|..."| Prisma
    API --> PDF
    Auth -->|"bcrypt + JWT"| Prisma
```

---

## 🔄 Data Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js Server
    participant API as API Route
    participant Prisma as Prisma ORM
    participant DB as SQLite
    participant Claude as Claude AI
    participant RSS as RSS Feeds

    Note over User,DB: 🟢 Static Data (One-time seed)
    NextJS->>Prisma: npx tsx prisma/seed.ts
    Prisma->>DB: INSERT 16 tables
    DB-->>Prisma: 100+ rows seeded

    Note over User,RSS: 🔵 Live Data (On-demand ingest)
    NextJS->>RSS: Fetch 8 RSS feeds
    RSS-->>NextJS: XML feed data
    NextJS->>Prisma: INSERT NewsItem (dedup)
    Prisma->>DB: Store new articles
    NextJS->>Claude: Tag this article
    Claude-->>NextJS: "POLICY"
    NextJS->>Prisma: UPDATE tag

    Note over User,DB: 🟣 User Request
    User->>Browser: Open localhost:3000
    Browser->>NextJS: GET / (SSR)
    NextJS->>Prisma: kpi.findMany()
    Prisma->>DB: SELECT * FROM Kpi
    DB-->>Prisma: 16 rows
    NextJS-->>Browser: HTML with KPI Strip
    Browser->>API: fetch("/api/news?region=INDIA")
    API->>Prisma: newsItem.findMany({where, include, take:20})
    Prisma->>DB: SELECT with JOIN
    DB-->>Prisma: 20 rows
    API-->>Browser: JSON response
    Browser-->>User: Render news cards
```

---

## 🎯 Feature Tabs

```mermaid
mindmap
  root((Gov Crypto<br/>Intel Hub))
    🇮🇳 India Intel
      Real-time Indian news
      Policy updates
      Enforcement actions
      FIU notifications
    🌍 Global News
      International crypto news
      6-category tagging
      Pinned & Breaking
      Paginated 20/page
    🏦 FIU Exchanges
      Registered VASPs
      Risk assessment
      Compliance status
      CEO/AML details
    ⚠️ Scam Registry
      10 scam types
      Attack vectors
      Red flags
      Investigation tips
    🗺️ Country Policies
      10 jurisdictions
      Regulatory stance
      FATF compliance
      CBDC status
    🏛️ GOV Advisory
      Legislative Tracker
      FATF 40 Recs Matrix
      TDS Budget Data
      State-wise Intel
      CARF 2027 Roadmap
      Policy Recommendations
      Legal Precedents
    📊 Analytics
      TDS Trend Chart
      Enforcement Timeline
      Exchange Risk Donut
      Scam Losses Bar
    🤖 AI Brief
      Claude Sonnet 4
      India Regulatory Pulse
      Global Threat Landscape
      Enforcement Watch
      15-min auto-refresh
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ AuditLog : "tracks"
    NewsSource ||--o{ NewsItem : "publishes"
    NewsItem }o--|| Exchange : "references"
    NewsItem }o--|| ScamType : "references"

    User {
        string id PK
        string email UK
        string name
        string password
        string role
        boolean isActive
        datetime createdAt
        datetime lastLoginAt
    }

    NewsSource {
        string id PK
        string name
        string url
        string type
        string region
        int frequencyHours
        boolean isActive
        datetime lastFetchedAt
        string lastError
    }

    NewsItem {
        string id PK
        string title
        string summary
        string body
        string url
        string sourceId FK
        string tag
        string region
        datetime publishedAt
        datetime ingestedAt
        boolean isPinned
        boolean isBreaking
        boolean isSuppressed
    }

    Exchange {
        string id PK
        string name
        string registrationNumber
        string status
        string jurisdiction
        string ceo
        string amlOfficer
        string assets
        string riskLevel
        string notices
        string alerts
    }

    ScamType {
        string id PK
        string name
        string description
        string riskLevel
        string indiaPrevalence
        string vectors
        string redFlags
        string victimProfile
        string investigationTips
    }

    Country {
        string id PK
        string name
        string isoCode
        string stance
        string regulatoryBody
        string keyLegislation
        string fatfStatus
        string cbdcStatus
    }

    Kpi {
        string id PK
        string label
        string value
        string colorClass
        string sourceCitation
        boolean isComputed
        string computeKey
    }

    AuditLog {
        string id PK
        string userId FK
        string action
        string tableName
        string recordId
        string beforeJson
        string afterJson
        datetime createdAt
    }

    AiBrief {
        string id PK
        string section1
        string section2
        string section3
        string sourceItemIds
        string modelUsed
        int tokensUsed
        datetime generatedAt
    }

    AlertRule {
        string id PK
        string name
        string trigger
        string action
        string target
        boolean isActive
    }
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    actor Admin
    participant LoginPage as /admin/login
    participant NextAuth as NextAuth.js
    participant Prisma as Prisma
    participant DB as SQLite
    participant JWT as JWT Token

    Admin->>LoginPage: Enter email + password
    LoginPage->>NextAuth: POST /api/auth/callback/credentials
    NextAuth->>Prisma: user.findUnique({email})
    Prisma->>DB: SELECT * FROM User WHERE email=?
    DB-->>Prisma: User row
    Prisma-->>NextAuth: User object
    NextAuth->>NextAuth: bcrypt.compare(password, hash)
    alt Valid credentials
        NextAuth->>Prisma: user.update({lastLoginAt: now()})
        NextAuth->>JWT: Sign {id, email, name, role}
        JWT-->>NextAuth: Encrypted token
        NextAuth-->>Admin: Set session cookie (8hr TTL)
        Admin->>Admin: Redirect to /admin/dashboard
    else Invalid credentials
        NextAuth-->>Admin: 401 Unauthorized
        Admin->>LoginPage: Show error message
    end
```

---

## 📡 News Ingestion Pipeline

```mermaid
flowchart TD
    Trigger["🔘 Trigger<br/>npx tsx src/lib/ingest.ts<br/>OR POST /api/ingest"] --> LoadSources

    LoadSources["📋 Load Active Sources<br/>prisma.newsSource.findMany()<br/>8 configured RSS feeds"] --> LoopSources

    LoopSources{"🔄 For Each Source"} -->|"Source 1..8"| FetchRSS
    FetchRSS["📡 Fetch RSS Feed<br/>rss-parser.parseURL(url)"] --> ParseItems

    ParseItems{"📰 For Each Item"} -->|"Item 1..N"| CheckDup
    CheckDup{"🔍 URL Exists in DB?"} -->|"Yes"| Skip["⏭️ Skip"]
    CheckDup -->|"No"| CreateNews["➕ Create NewsItem<br/>title • summary • body<br/>url • sourceId • region<br/>publishedAt • tag=''"]
    CreateNews --> UpdateCount["📊 Increment Count"]

    Skip --> ParseItems
    UpdateCount --> ParseItems

    ParseItems -->|"All Items Done"| UpdateSource["✅ Update Source<br/>lastFetchedAt = now()<br/>lastError = null"]
    UpdateSource --> LoopSources

    LoopSources -->|"All Sources Done"| CheckAPIKey{"🔑 ANTHROPIC_API_KEY?"}

    CheckAPIKey -->|"No"| Done["🏁 Ingestion Complete"]
    CheckAPIKey -->|"Yes"| AutoTag

    AutoTag["🏷️ Auto-Tag Pipeline"] --> FetchUntagged["Fetch 50 Untagged Items<br/>WHERE tag = ''"]
    FetchUntagged --> TagLoop{"For Each Item"}
    TagLoop --> CallClaude["🤖 Call Claude Haiku 4<br/>Classify into:<br/>POLICY | ENFORCEMENT<br/>COMPLIANCE | SCAM<br/>MARKET | INNOVATION"]
    CallClaude --> ValidateTag{"Valid Tag?"}
    ValidateTag -->|"Yes"| UpdateTag["✏️ UPDATE tag"]
    ValidateTag -->|"No"| SkipTag["⏭️ Skip"]
    UpdateTag --> TagLoop
    SkipTag --> TagLoop
    TagLoop -->|"All Done"| Done

    style Trigger fill:#3b82f6,color:#fff
    style Done fill:#22c55e,color:#fff
    style CallClaude fill:#7b61ff,color:#fff
    style AutoTag fill:#7b61ff,color:#fff
```

---

## 📊 Analytics Data Flow

```mermaid
flowchart LR
    subgraph Sources["📥 Data Sources"]
        TDS["AdvisoryTds<br/>5 records"]
        Exchanges["Exchange<br/>8 records"]
        News["NewsItem<br/>ENFORCEMENT tag"]
        States["AdvisoryState<br/>8 states"]
        GST["AdvisoryGst<br/>4 years"]
    end

    subgraph API["🔌 /api/analytics"]
        Aggregation["Data Aggregation<br/>• Risk counts<br/>• Year grouping<br/>• Sum calculations"]
    end

    subgraph Charts["📊 Chart.js Output"]
        Chart1["TDS Trend<br/>Bar Chart"]
        Chart2["Enforcement Timeline<br/>Bar Chart"]
        Chart3["Exchange Risk<br/>Doughnut"]
        Chart4["Scam Losses<br/>Bar Chart"]
    end

    TDS --> Aggregation
    Exchanges --> Aggregation
    News --> Aggregation
    States --> Aggregation
    GST --> Aggregation

    Aggregation --> Chart1
    Aggregation --> Chart2
    Aggregation --> Chart3
    Aggregation --> Chart4

    style Aggregation fill:#3b82f6,color:#fff
    style Chart1 fill:#f97316,color:#fff
    style Chart2 fill:#ef4444,color:#fff
    style Chart3 fill:#22c55e,color:#fff
    style Chart4 fill:#8b5cf6,color:#fff
```

---

## 📄 Export System

```mermaid
flowchart TD
    ExportAPI["GET /api/export<br/>?format=&table="] --> FormatCheck{"format?"}

    FormatCheck -->|"json"| JSONResp["📋 JSON Response<br/>Content-Type: application/json"]
    FormatCheck -->|"csv"| CSVBuild["Build CSV<br/>headers.join(',')<br/>+ rows.map()"]
    CSVBuild --> CSVResp["📊 CSV Download<br/>Content-Disposition: attachment"]

    PDFAPI["GET /api/export/pdf<br/>?table="] --> FetchData["Fetch Table Data<br/>news | exchanges<br/>scams | countries"]
    FetchData --> BuildPDF["🏗️ Build PDF Document"]
    BuildPDF --> Header["🔷 Navy Header Bar<br/>GOVERNMENT CRYPTO<br/>INTELLIGENCE HUB"]
    Header --> SubHeader["📌 Sub-header<br/>Digital South Trust<br/>BCoE, Vellore"]
    SubHeader --> Title["📝 Report Title<br/>+ IST Timestamp"]
    Title --> Table["📊 Auto-Table<br/>Styled headers<br/>Alternating rows"]
    Table --> Footer["🔒 Footer (every page)<br/>OFFICIAL USE ONLY"]
    Footer --> PDFResp["📕 PDF Download<br/>Content-Type: application/pdf"]

    style ExportAPI fill:#3b82f6,color:#fff
    style PDFAPI fill:#3b82f6,color:#fff
    style PDFResp fill:#22c55e,color:#fff
    style CSVResp fill:#22c55e,color:#fff
    style JSONResp fill:#22c55e,color:#fff
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + Custom Navy Theme |
| **Charts** | Chart.js 4 + react-chartjs-2 |
| **Icons** | Lucide React |
| **ORM** | Prisma 5 |
| **Database** | SQLite (dev) / PostgreSQL (prod-ready) |
| **Auth** | NextAuth.js 4 (Credentials + JWT) |
| **AI Brief** | Claude Sonnet 4 |
| **Auto-Tag** | Claude Haiku 4 |
| **PDF Export** | jsPDF + jspdf-autotable |
| **RSS Ingest** | rss-parser |

---

## 📦 Quick Start

```bash
# 1. Clone & Install
git clone <repo-url>
cd gov-crypto-intel-hub
npm install

# 2. Initialize Database
npx prisma db push
npx tsx prisma/seed.ts

# 3. Start Development Server
npm run dev
# → http://localhost:3000
```

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@govcryptointel.org` |
| Password | `admin123` |
| Role | SUPER_ADMIN |

> ⚠️ **Change the default password immediately in production.**

---

## 📋 NPM Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build (29 pages, zero errors) |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Run seed script (100+ sourced records) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run ingest` | Run RSS ingestion + Claude auto-tag |

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Total Pages | **29** |
| API Endpoints | **13** |
| Database Tables | **16** |
| Seed Records | **100+** |
| Tab Components | **8** |
| Chart Visualizations | **4** |
| Admin Panel Pages | **15** |
| Build Errors | **0** |
| Placeholder Data | **0** |

---

## 📄 Documentation

- **[CHANGES.md](CHANGES.md)** — Complete PRD deviation log with reasons and migration paths
- **[docs/report.pdf](docs/report.pdf)** — 30-page comprehensive LaTeX technical report
- **[docs/report.tex](docs/report.tex)** — LaTeX source for the technical report

---

## 🔒 Classification

<p align="center">
  <b>OFFICIAL USE ONLY</b><br/>
  <sub>This repository contains sensitive government intelligence infrastructure code.<br/>
  Distribution restricted to authorized personnel only.</sub>
</p>

<p align="center">
  <sub>© 2026 Digital South Trust • Blockchain Centre of Excellence, Vellore</sub>
</p>