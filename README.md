<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=36&duration=2500&pause=1000&color=00F5FF&center=true&vCenter=true&repeat=true&width=900&lines=✦+AdPilot+AI+✦;MARKETING+INTELLIGENCE+NEXUS;ANALYZE+•+OPTIMIZE+•+DOMINATE" />
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=300&text=✦%20AdPilot%20AI%20✦&fontSize=55&fontColor=00F5FF&color=0:0F172A,50:111827,100:4F46E5&animation=twinkling&desc=marketing%20intelligence%20nexus&descSize=18&descAlignY=75&descColor=7C3AED"/>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=soft&height=40&text=⋆｡°✩%20premium%20AI%20marketing%20intelligence%20✩°｡⋆&fontColor=00F5FF&fontSize=14&color=0:0A0A0F,100:1A1A40"/>
</p>

<br>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=00F5FF&labelColor=0A0A0F"/></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=0A0A0F"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=3178C6&labelColor=0A0A0F"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=00F5FF&labelColor=0A0A0F"/></a>
  <a href="#"><img src="https://img.shields.io/badge/AI-Powered-00F5FF?style=for-the-badge&labelColor=0A0A0F&color=00F5FF"/></a>
  <a href="#"><img src="https://img.shields.io/badge/JWT-Auth-FF00E5?style=for-the-badge&labelColor=0A0A0F&color=FF00E5"/></a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=4&color=0:00F5FF,100:7C3AED"/>
</p>

<br>

<p align="center">
  <img width="95%" src="https://capsule-render.vercel.app/api?type=rect&height=180&text=Cyber%20Marketing%20Command%20Center&fontColor=00F5FF&fontSize=34&color=0:0A0A0F,100:1A1A40&desc=AI-powered%20marketing%20intelligence%20for%20the%20next%20generation%20✦%20analyze%20✦%20optimize%20✦%20dominate&descSize=14&descAlignY=72&descColor=7C3AED"/>
</p>

<br>

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,prisma,tailwind,sqlite,nodejs,vercel&theme=dark&perline=8" />
  </a>
</p>

<br>

---

## 🧠 System Architecture

```mermaid
flowchart TB
    subgraph Frontend["🌐 Next.js 16 Frontend"]
        direction TB
        LP["🏠 Landing Page<br/>Pricing · FAQ · Testimonials"]
        AUTH["🔐 Auth Pages<br/>Login · Register · Verify"]
        DASH["📊 Dashboard<br/>Metrics · Charts · KPIs"]
        CM["📢 Campaigns<br/>CRUD · Detail · Import"]
        AN["📈 Analytics<br/>Charts · Filters · Export"]
        CS["🎨 Creative Studio<br/>AI Copy · History"]
        CP["💬 AI Copilot<br/>Chat · Models"]
        AT["⚡ Automation<br/>Rules · Triggers"]
        RP["📑 Reports<br/>Generate · PDF"]
        INT["🔗 Integrations<br/>Platforms · Status"]
        ADM["🛡️ Admin Panel<br/>Users · Billing · Settings"]
    end

    subgraph API["⚙️ API Layer"]
        direction TB
        API_AUTH["🔑 Auth API<br/>JWT · bcrypt · Cookies"]
        API_CRM["📋 Campaign API<br/>CRUD · Search · Import"]
        API_AI["🤖 AI API<br/>OpenRouter · Ollama · LM Studio"]
        API_AN["📊 Analytics API"]
        API_RP["📑 Reports API<br/>jsPDF Generation"]
        API_AT["⚡ Automation API"]
        API_BL["💳 Billing API<br/>Plans · Transactions"]
        API_ADM["🛡️ Admin API<br/>Stats · Users · Updates"]
    end

    subgraph DB["🗄️ Data Layer"]
        direction TB
        DB_PRISMA["Prisma 7 ORM"]
        DB_SQLITE["SQLite Database"]
        DB_MOCK["📦 Mock Data Layer<br/>8 Campaigns · Users · Charts"]
    end

    Frontend --> API
    API --> DB
    DB --> DB_PRISMA --> DB_SQLITE
    DB_PRISMA -.-> DB_MOCK
    API_AI --> AI_PROVIDERS

    subgraph AI_PROVIDERS["🧠 AI Providers"]
        OR["OpenRouter<br/>GPT-4o-mini"]
        OL["Ollama<br/>Local"]
        LMS["LM Studio<br/>Local"]
    end

    style Frontend fill:#1a1a2e,stroke:#7C3AED,stroke-width:2px
    style API fill:#16213e,stroke:#00F5FF,stroke-width:2px
    style DB fill:#0f3460,stroke:#FF00E5,stroke-width:2px
    style AI_PROVIDERS fill:#1a1a2e,stroke:#7C3AED,stroke-width:1px
```

```mermaid
flowchart LR
    subgraph AUTH["🔐 Auth Flow"]
        REG["Register"] --> VERIFY["Verify Email"]
        LOGIN["Login"] --> JWT["JWT Token<br/>httpOnly Cookie"]
        JWT --> API_ACCESS["API Access"]
    end

    subgraph DATA["📊 Data Flow"]
        UI["User Input"] --> MOCK["Mock Service"]
        MOCK --> RESP["Response"]
        MOCK -.-> DB_FUTURE["Prisma DB<br/>(Coming Soon)"]
    end

    subgraph PAYMENT["💳 Billing Flow"]
        PLAN["Select Plan"] --> TIER["Pricing Tier"]
        TIER --> CHECKOUT["Checkout"]
        CHECKOUT --> PAYMENT_GW["Payment Gateway<br/>(Stub)"]
        PAYMENT_GW --> SUCCESS["Success"]
    end

    style AUTH fill:#1a1a2e,stroke:#00F5FF
    style DATA fill:#1a1a2e,stroke:#7C3AED
    style PAYMENT fill:#1a1a2e,stroke:#FF00E5
```

<br>

---

## ✨ Features — What's Built

### 🔐 Authentication & Security
| Module | Details |
|:-------|:--------|
| **JWT Auth** | bcrypt password hashing, httpOnly cookie sessions |
| **Email Verification** | Nodemailer-based verification flow |
| **Role Management** | User / Admin roles with route guards |
| **Session Management** | Auth context provider, protected API middleware |

---

### 📊 Dashboard & Analytics
| Module | Details |
|:-------|:--------|
| **📈 Main Dashboard** | 8 KPI cards (Spend, Revenue, ROAS, CPA, CTR, Conversions, Active Campaigns, Budget), area chart (7-day trends), bar chart (campaign comparison), top campaigns table |
| **🔍 Campaign List** | Search, platform/status badges, CRUD with plan limit enforcement |
| **📋 Campaign Detail** | Per-campaign metrics, area chart, info table |
| **📊 Analytics Page** | Metric cards, area chart, pie chart (platform breakdown), bar chart (daily performance) |

---

### 🧠 AI Capabilities
| Module | Details |
|:-------|:--------|
| **🤖 AI Copilot** | Chat interface with conversation history, model selector (GPT-4, GPT-3.5, Claude 3), suggested prompts, markdown rendering |
| **🎨 Creative Studio** | AI ad copy generator for Google / Meta / TikTok / Taboola — 6 creative types (headline, text, description, CTA, email, landing page) with history |
| **📑 CSV Analysis** | Upload CSV → column mapping → AI generates executive summary, wasted spend analysis, opportunities, budget recommendations |
| **🔌 Provider System** | Pluggable: OpenRouter (default), Ollama (local), LM Studio (local), Custom |

---

### ⚡ Automation & Reports
| Module | Details |
|:-------|:--------|
| **⚙️ Automation Rules** | 5 trigger types (ROAS threshold, budget exceeded, CPA spike, CTR drop, schedule) × 5 action types (notify, pause campaign, adjust budget, generate report, send email) |
| **📑 Report Generator** | 4 templates (Weekly, Monthly, Campaign Summary, Performance Breakdown), PDF download via jsPDF, status tracking |
| **🔔 Smart Notifications** | Filterable (Success, Warning, Error, Recommendations), mark-as-read |

---

### 💼 Business & Admin
| Module | Details |
|:-------|:--------|
| **🏪 Landing Page** | Hero, feature highlights, testimonial carousel, FAQ accordion, footer |
| **💳 Pricing** | 5 tiers: Free, Starter ($9), Professional ($29), Business ($79), Enterprise ($199) |
| **🛒 Checkout** | Multi-step: country → currency → payment method → processing → success |
| **🛡️ Admin Panel** | Dashboard (user count, revenue, subs), User management, Settings, Changelog, Billing (MRR, ARR, Churn, ARPU, LTV, transactions, subscriptions, coupons) |
| **⚙️ Settings** | Profile, Workspace, Password, Notifications, Danger Zone tabs |

---

### 🔗 Integrations
| Platform | Status |
|:---------|:-------|
| Google Ads | 🔌 Connection UI + card |
| Meta Ads | 🔌 Connection UI + card |
| TikTok Ads | 🔌 Connection UI + card |
| Taboola | 🔌 Connection UI + card |
| HubSpot | 🔌 Connection UI + card |
| Salesforce | 🔌 Connection UI + card |
| Shopify | 🔌 Connection UI + card |
| Slack | 🔌 Connection UI + card |

---

### 🧩 Additional Features
| Feature | Description |
|:--------|:------------|
| **🌐 Global Search** | Cmd+K modal searching campaigns, reports, messages |
| **🎯 Onboarding Tour** | Multi-step interactive tour covering all dashboard features |
| **📱 Responsive Sidebar** | Collapsible navigation with admin link |
| **🗄️ Database Schema** | 19 Prisma models: User, Workspace, Campaign, Creative, Insight, Recommendation, Conversation, Message, Automation, Report, Integration, Notification, Settings, AuditLog, SiteSettings, UpdateLog, BillingPlan, Subscription, Transaction, Invoice, Refund, Coupon |
| **📦 Mock Data** | 8 campaigns across Google / Meta / TikTok / Taboola, mock automations, analytics, conversations, recommendations |

<br>

---

## 🌐 System Status

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=0:00F5FF,100:7C3AED"/>
</p>

<p align="center">

| MODULE | STATUS | UPTIME | LOAD |
|:-------|:------:|:------:|:----:|
| 🟢 **AI Core** | `ONLINE` | 99.99% | 12% |
| 🟣 **Analytics Engine** | `ACTIVE` | 99.97% | 34% |
| 🔵 **Campaign Controller** | `RUNNING` | 99.95% | 28% |
| 🟢 **Automation Nexus** | `ENABLED` | 99.99% | 8% |
| 🔷 **Database Cluster** | `CONNECTED` | 99.99% | 22% |
| ⚡ **Intelligence Feed** | `REAL-TIME` | 99.98% | 16% |

</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=0:7C3AED,100:00F5FF"/>
</p>

<br>

---

## 🛠 Tech Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,prisma,tailwind,sqlite,nodejs,vercel,postgres,figma&theme=dark&perline=10" />
  </a>
</p>

<p align="center">
  <sub><i>hover over icons for a closer look ✦ premium stack for premium results</i></sub>
</p>

<br>

| Category | Technologies |
|:---------|:-------------|
| **Framework** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Framer Motion, CVA, Lucide Icons |
| **Database** | Prisma 7, SQLite, Better-SQLite3 |
| **Auth** | JWT (bcryptjs + httpOnly cookies), Nodemailer |
| **Charts** | Recharts, date-fns |
| **State** | Zustand (persisted), TanStack React Query 5 |
| **AI** | OpenRouter (GPT-4o-mini), Ollama, LM Studio |
| **PDF** | jsPDF |
| **Validation** | Zod 4 |
| **Deployment** | Vercel |

<br>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/ayushnandi718-dev/adpilot-ai.git
cd adpilot-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your JWT secret and email credentials

# Initialize the database
npx prisma generate
npx prisma db push

# Seed admin user (optional)
npm run create-admin

# Start the development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — your command center awaits.

<br>

---

## 🔐 Environment Variables

| Variable | Description | Required |
|:---------|:------------|:--------:|
| `DATABASE_URL` | Database connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `SMTP_HOST` | Email server host | ◻️ |
| `SMTP_PORT` | Email server port | ◻️ |
| `SMTP_USER` | Email server user | ◻️ |
| `SMTP_PASS` | Email server password | ◻️ |
| `OPENROUTER_API_KEY` | OpenRouter API key | ◻️ |
| `DEFAULT_AI_PROVIDER` | Default AI provider | ◻️ |
| `ADMIN_EMAIL` | Predefined admin login email | ◻️ |
| `ADMIN_PASSWORD` | Predefined admin login password | ◻️ |

<br>

---

## 📦 Deployment

<table>
<tr>
<td width="50%" valign="top">

### ▲ Vercel
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy ✨

</td>
<td width="50%" valign="top">

### ⚙️ Manual
```bash
npm run build
npm start
```

</td>
</tr>
</table>

<br>

---

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/         # 30+ REST API endpoints
│   ├── auth/        # Login, Register, Verify pages
│   ├── dashboard/   # Dashboard, Campaigns, Analytics, etc.
│   └── layout.tsx   # Root layout with providers
├── components/       # Reusable UI components
│   ├── ui/          # Base primitives (button, card, modal, etc.)
│   ├── layout/      # Sidebar, Header, Shell
│   └── shared/      # Cross-feature shared components
├── features/        # Feature-specific components & logic
├── hooks/           # Custom React hooks
├── services/        # Business logic (campaign, AI, etc.)
├── repositories/    # Data access layer (Prisma + mock fallback)
├── store/           # Zustand stores (campaign-store)
├── providers/       # React context providers (Auth, Query)
├── lib/             # Utilities, constants, types
├── mock/            # Development mock data
└── generated/       # Prisma client output
```

<br>

---

## 🗺️ API Routes

| Category | Endpoints |
|:---------|:----------|
| **🔑 Auth** | `POST login`, `POST register`, `POST logout`, `GET me`, `GET verify-email`, `POST send-verification` |
| **📢 Campaigns** | `GET all`, `GET/:id`, `DELETE/:id`, `GET search`, `POST import`, `POST analyze` |
| **🤖 AI** | `POST /api/ai` (completions), `POST /api/copilot` (chat) |
| **📊 Analytics** | `GET /api/analytics` |
| **📈 Dashboard** | `GET /api/dashboard` |
| **⚡ Automations** | `GET`, `POST /api/automations` |
| **📑 Reports** | `GET`, `POST /api/reports` |
| **💡 Recommendations** | `GET /api/recommendations` |
| **🔔 Notifications** | `GET /api/notifications` |
| **⚙️ Settings** | `GET`, `PUT /api/settings` |
| **🔍 Search** | `GET /api/search` |
| **💳 Billing** | `POST /api/billing/create-payment` |
| **🛡️ Admin** | `GET stats`, Users CRUD, Settings CRUD, Updates CRUD, Billing management |

<br>

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=soft&height=60&text=✦%20Metrics%20&%20Analytics%20✦&fontColor=00F5FF&fontSize=22&color=0:0A0A0F,100:1A1A40"/>
</p>

<br>

<p align="center">
  <a href="https://github.com/ayushnandi718-dev">
    <img height="180em" src="https://github-readme-stats.vercel.app/api?username=ayushnandi718-dev&show_icons=true&theme=tokyonight&include_all_commits=true&count_private=true&hide_border=true&rank_icon=github&bg_color=0A0A0F&title_color=00F5FF&icon_color=7C3AED&text_color=c0caf5&border_color=1A1A40"/>
    <img height="180em" src="https://github-readme-streak-stats.herokuapp.com/?user=ayushnandi718-dev&theme=tokyonight&hide_border=true&background=0A0A0F&stroke=7C3AED&ring=00F5FF&fire=FF00E5&currStreakNum=00F5FF&sideNums=7C3AED"/>
  </a>
</p>

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=ayushnandi718-dev&layout=compact&theme=tokyonight&hide_border=true&bg_color=0A0A0F&title_color=00F5FF&text_color=c0caf5&border_color=1A1A40"/>
</p>

<br>

<p align="center">
  <img src="https://github-profile-3d-contrib.vercel.app/api/account/ayushnandi718-dev?theme=cyberpunk" width="90%"/>
</p>

<br>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0:00F5FF,50:7C3AED,100:FF00E5"/>
</p>

---

## 🤝 Open for Contributions

<p align="center">
  <img src="https://img.shields.io/badge/PRs-Welcome-00F5FF?style=for-the-badge&labelColor=0A0A0F&color=7C3AED"/>
  <img src="https://img.shields.io/badge/Contributions-Open-00F5FF?style=for-the-badge&labelColor=0A0A0F&color=00F5FF"/>
  <img src="https://img.shields.io/badge/Fresh%20Ideas-Yes!-FF00E5?style=for-the-badge&labelColor=0A0A0F&color=FF00E5"/>
</p>

We're actively looking for contributors! Here's how you can help:

### 🚀 Ways to Contribute

| Area | Ideas |
|:-----|:------|
| **🧠 AI Features** | More ad copy generators, A/B test predictions, sentiment analysis |
| **🔌 Integrations** | Real Google/Meta/TikTok API connectors (instead of stubs) |
| **💳 Payments** | Wire up Stripe, PayPal, Razorpay webhooks |
| **📊 Analytics** | Export to CSV/PDF, custom date ranges, real-time dashboards |
| **⚡ Automation** | Background job runner, Slack/email notifications |
| **🎨 UI/UX** | Dark mode variants, mobile polish, animations |
| **🐛 Bug Fixes** | Check the [Issues](../../issues) tab |
| **📖 Docs** | Improve API docs, add usage examples |

### 📋 Getting Started

```bash
# Fork & clone
git clone https://github.com/your-username/adpilot-ai.git
cd adpilot-ai

# Install
npm install

# Create branch
git checkout -b feature/your-feature-name

# Make changes & commit
git commit -m "feat: add your feature description"

# Push & open a PR
git push origin feature/your-feature-name
```

### ✅ Guidelines

- Keep PRs focused — one feature/fix per PR
- Follow existing code style (TypeScript, Tailwind, no comments)
- Test your changes with `npm run lint` and `npx tsc --noEmit`
- Update the README if your change affects usage
- Be kind and constructive in code reviews

<p align="center">
  <sub>All skill levels welcome. If you're new to open source, we're here to help you through your first PR! 🚀</sub>
</p>

---

## 🏷️ Tags

<p align="center">

`ai-marketing` `nextjs` `react` `typescript` `prisma` `sqlite` `tailwind-css` `jwt-auth` `saas` `marketing-intelligence` `ad-copy-generator` `campaign-management` `analytics-dashboard` `openrouter` `framer-motion` `zustand` `react-query` `recharts`

</p>

<p align="center">
  <sub>Click the <b>🏷️ Topics</b> button at the top of the repo to add these tags on GitHub.</sub>
</p>

<br>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0:00F5FF,50:7C3AED,100:FF00E5"/>
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=ayushnandi718-dev&style=for-the-badge&color=00F5FF&label=VISITORS&labelColor=0A0A0F"/>
</p>

<br>

<p align="center">

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ **SYSTEM ONLINE** • 🧠 **AI CORE ACTIVE** • 🌐 **NEURAL LINK ESTABLISHED** ⚡

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

</p>

<p align="center">
  <sub><i>crafted with 🩷 — where data meets design</i></sub>
</p>

<p align="center">
  <sub>made by <strong>AYUSH NANDI</strong> — <a href="mailto:ayushnandi718@gmail.com">ayushnandi718@gmail.com</a></sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&section=footer&height=220&color=0:00F5FF,30:7C3AED,70:FF00E5,100:0A0A0F&animation=twinkling"/>
</p>
