<div align="center">

<br>

<img src="https://img.shields.io/badge/%E2%96%B2-TEAMTRUTH-black?style=for-the-badge&labelColor=000000&color=111111" height="40"/>

<br><br>

# `T E A M T R U T H`

### ⬡ The Zero-Trust Accountability Engine for Engineering Teams ⬡

<br>

<p>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-000000?style=for-the-badge&logo=opensourceinitiative&logoColor=white" /></a>
  <img src="https://img.shields.io/badge/NODE.JS-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/GROQ-AI_INFERENCE-F55036?style=for-the-badge&logo=probot&logoColor=white" />
  <img src="https://img.shields.io/badge/STATUS-MVP-7C3AED?style=for-the-badge" />
</p>

<br>

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   "Built for radical transparency,                               ║
║    because no one gets the benefit of the doubt."                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

<br>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-what-it-does">Solution</a> •
  <a href="#-the-core-loop">Architecture</a> •
  <a href="#-tech-stack">Stack</a> •
  <a href="#-getting-started">Setup</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

<br>

---

<br>

## 🔴 The Problem

<table>
<tr>
<td>

Group projects **silently collapse** before anyone admits it.

Tasks get misreported. Teammates ghost before deadlines. Existing tools like Jira or Notion trust humans to self-report progress honestly.

**They never do.**

TeamTruth doesn't *ask* your team to be honest — it **verifies** them.

</td>
</tr>
</table>

<br>

---

<br>

## ⚡ What It Does

<br>

<div align="center">

> MVP implements the core AI Contradiction Engine and Vectorize Hindsight memory graph. V2 Roadmap: Direct GitHub webhook integration for automated commit-history cross-referencing.

</div>

<br>

When a developer says *"I finished the database schema,"* TeamTruth doesn't applaud — **it checks.**

If that person promised the same thing two weeks ago and nothing was delivered, it:

```diff
- ✖ FLAGS the broken promise publicly
- ✖ DEDUCTS their Trust Score in real time
- ✖ SURFACES the original unfulfilled commitment with full context
```

> No more hiding. No more amnesia. Every promise has a receipt.

<br>

---

<br>

## 🔁 The Core Loop

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ① RETAIN ──→ ② RECALL ──→ ③ REFLECT              │
│       │            │              │                 │
│       ▼            ▼              ▼                 │
│    Log to       Query by       Cross-ref &          │
│    Memory       User+Task      Score Trust          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

| Step | Phase | Description |
|------|-------|-------------|
| 01 | 🟢 **RETAIN** | Every promise, claim, and deliverable is logged into a persistently indexed memory bank via the Vectorize Hindsight Cloud API. Nothing is forgotten. Ever. |
| 02 | 🟡 **RECALL** | When a new update is posted, the agent queries Hindsight for historical claims from that specific user relevant to the same feature or task. |
| 03 | 🔴 **REFLECT** | A two-stage AI pipeline cross-references history against the new claim, computes a contradiction score, and updates the live Trust Gauge. |

<br>

---

<br>

## 🧠 Architecture — Two-Call AI Pipeline

**Why two calls instead of one?**

Because one model can't reason freely *and* produce guaranteed-valid JSON. Combining both in a single prompt is the #1 cause of hallucinated scores and broken parsers in AI systems. We split the problem in half.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   INCOMING CLAIM                                                     │
│        │                                                             │
│        ▼                                                             │
│   ┌─────────────────────────────────────────────┐                   │
│   │  CALL 1 — REASONING                         │                   │
│   │  Model: llama-3.3-70b-versatile             │                   │
│   │                                             │                   │
│   │  • Receives full context                    │                   │
│   │  • New claim + historical memory + roster   │                   │
│   │  • Reasons freely in natural language       │                   │
│   │  • Identifies contradictions & patterns     │                   │
│   └──────────────────┬──────────────────────────┘                   │
│                      │                                               │
│                      ▼                                               │
│   ┌─────────────────────────────────────────────┐                   │
│   │  CALL 2 — EXTRACTION                        │                   │
│   │  Model: llama-4-scout-17b + json_schema     │                   │
│   │                                             │                   │
│   │  • Receives ONLY the reasoning output       │                   │
│   │  • Strict JSON schema at token level        │                   │
│   │  • Outputs: { trust_delta, flag, reason }   │                   │
│   │  • 100% deterministic. No exceptions.       │                   │
│   └──────────────────┬──────────────────────────┘                   │
│                      │                                               │
│                      ▼                                               │
│              TRUST SCORE UPDATED                                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

<details>
<summary>💡 Why This Matters (click to expand)</summary>

<br>

This eliminates the #1 failure mode of AI scoring systems: **unpredictable, hallucinated JSON** that breaks the application at runtime.

- **Call 1** (`llama-3.3-70b-versatile`) — the large model has full creative freedom to reason across complex, messy, real-world team communication. No schema constraints.
- **Call 2** (`llama-4-scout-17b` + `json_schema`) — a smaller, faster model receives only the clean reasoning summary and is constrained by a strict JSON schema enforced at the **token level** by Groq. It is **structurally impossible** for it to output malformed JSON.

The Trust Score is mathematically guaranteed to be consistent, parseable, and hallucination-free — every single time.

</details>

<br>

---

<br>

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| 🎨 **Frontend** | React 19 · Vite 6 · Tailwind CSS v4 · Framer Motion |
| ⚙️ **Backend** | Node.js · Express.js |
| 🧠 **AI Inference** | Groq API — `llama-3.3-70b-versatile` + `llama-4-scout-17b` |
| 💾 **Memory** | Vectorize Hindsight Cloud API — persistent vector store |
| 🚫 **Constraint** | 100% JavaScript / Node.js — Zero Python |

<br>

---

<br>

## 🚀 Getting Started

**Prerequisites**

```
✦  Node.js 20+
✦  Groq API Key           → https://console.groq.com
✦  Hindsight API Key      → https://vectorize.io
✦  Hindsight Bank ID      → Created in the Vectorize dashboard
```

### 01 — Backend

```bash
cd backend
npm install
```

Create `.env` from the example:

```env
# ── Server ──────────────────────────────────
PORT=5000

# ── AI Inference ────────────────────────────
GROQ_API_KEY=gsk_...your_key_here...

# ── Memory / Vector Store ───────────────────
HINDSIGHT_API_KEY=hsk_...your_key_here...
BANK_ID=teamtruth-bank
```

```bash
npm start
```

### 02 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're live.

<br>

---

<br>

## 🎬 Demo

| # | Step |
|---|------|
| ① | Boot up both frontend and backend servers. |
| ② | Click **"Seed Memory"** (top right) to pre-load Hindsight with historically unfulfilled tasks for the user *"Bob"*. |
| ③ | In the chat, send: **`"I finished the database schema."`** |
| ④ | Watch TeamTruth instantly surface the contradictory logs, flag the broken promise, and drop Bob's Trust Score in real time. |

<br>

---

<br>

## ✅ Current Release — MVP

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   CHAT ACCOUNTABILITY PROTOCOL v1                          │
│                                                            │
│   [✓] Persistent AI memory via Vectorize Hindsight         │
│   [✓] Real-time Trust Score with live visual gauge         │
│   [✓] Two-Call AI Pipeline — deterministic scoring         │
│   [✓] Team dashboard with per-member reliability           │
│   [✓] Public contradiction flagging in shared feed         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

<br>

---

<br>

## 🗺 Roadmap

```
╔═══════════════════════════════════════════════════════════╗
║                     V2  —  NEXT UP                        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   GITHUB WEBHOOK INTEGRATION                              ║
║                                                           ║
║   • Register webhook → TeamTruth backend                  ║
║   • Auto-ingest push, PR, and issue events                ║
║   • Cross-ref commits against open promises               ║
║   • Passive Trust Score updates from real code            ║
║   • Zero human input required                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

V2 transforms TeamTruth from a chat tool into a **passive, always-on accountability layer** embedded directly in the development workflow.

<br>

| Phase | Milestone | Status |
|-------|-----------|--------|
| V1 | Chat Accountability Protocol | ✅ Shipped |
| V2 | GitHub Webhook Integration | 🔧 In Progress |
| V3 | Slack / Discord Bot Deployment | 📋 Planned |
| V4 | Multi-repo Org-wide Trust Dashboards | 📋 Planned |

<br>

---

<br>

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

<br>

---

<br>

<div align="center">

```
████████╗███████╗ █████╗ ███╗   ███╗████████╗██████╗ ██╗   ██╗████████╗██╗  ██╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║╚══██╔══╝██╔══██╗██║   ██║╚══██╔══╝██║  ██║
   ██║   █████╗  ███████║██╔████╔██║   ██║   ██████╔╝██║   ██║   ██║   ███████║
   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║   ██║   ██╔══██╗██║   ██║   ██║   ██╔══██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║   ██║   ██║  ██║╚██████╔╝   ██║   ██║  ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝
```

*Every promise has a receipt. Every claim has a checksum. Every teammate has a score.*

</div>
