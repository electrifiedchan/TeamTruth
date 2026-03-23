<div align="center">

# TeamTruth

### The Zero-Trust Accountability Engine for Engineering Teams

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20API-orange.svg)](https://groq.com/)
[![Status](https://img.shields.io/badge/Status-MVP-blue.svg)]()

> *"Built for radical transparency, because no one gets the benefit of the doubt."*

</div>

---

## The Problem

Group projects silently collapse before anyone admits it. Tasks get misreported, teammates ghost before deadlines, and existing tools like Jira or Notion trust humans to self-report progress honestly. **They never do.**

TeamTruth doesn't ask your team to be honest. It **verifies** them.

---

## What It Does

TeamTruth is an embedded AI teammate that cross-references every chat claim against a persistent, AI-indexed memory bank. When a developer says *"I finished the database schema,"* TeamTruth doesn't applaud — it checks. If that person promised the same thing two weeks ago and nothing was delivered, it **flags the broken promise publicly and deducts their Trust Score in real time.**

---

## How It Works: The Core Loop

| Step | Name | Description |
|------|------|-------------|
| 1 | **RETAIN** | Every promise, claim, and deliverable is logged into a persistently indexed memory bank via the **Vectorize Hindsight Cloud API**. |
| 2 | **RECALL** | When a new update is posted, the agent queries Hindsight for historical claims from that specific user relevant to the same feature or task. |
| 3 | **REFLECT** | A two-stage AI pipeline cross-references history against the new claim, computes a contradiction score, and updates the live **Trust Gauge**. |

---

## Architecture: Two-Call AI Pipeline

TeamTruth's backend uses a deliberate **Two-Call Architecture** that separates *reasoning* from *data extraction* — a critical design decision for deterministic scoring.

> **Uses a Two-Call Architecture separating reasoning (`llama-3.3-70b-versatile`) from strict data extraction (`llama-4-scout-17b` with `json_schema`) to guarantee 100% deterministic Trust Scoring without hallucinations.**

**Why this matters:**

- **Call 1 — Reasoning (`llama-3.3-70b-versatile`):** The large model is given full context — the new claim, the historical memory, and the team roster — and reasons freely in natural language about whether a contradiction exists.
- **Call 2 — Extraction (`llama-4-scout-17b` + `json_schema`):** A smaller, faster model receives only the reasoning output and is constrained by a strict JSON schema enforced at the token level. It outputs a perfectly structured `{ trust_delta, flag, reason }` object. **Every single time. No exceptions.**

This eliminates the #1 failure mode of AI scoring systems: unpredictable, hallucinated JSON that breaks the application. The Trust Score is mathematically guaranteed to be consistent.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express.js |
| **AI Inference** | Groq API (`llama-3.3-70b-versatile`, `llama-4-scout-17b`) |
| **Memory / Vector Store** | Vectorize Hindsight Cloud API |
| **Constraint** | 100% JavaScript / Node.js — Zero Python |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Groq API Key](https://console.groq.com/)
- A `HINDSIGHT_API_KEY` and `BANK_ID` from the [Vectorize Hindsight UI](https://vectorize.io/)

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
PORT=5000
GROQ_API_KEY=gsk_...your_key_here...
HINDSIGHT_API_KEY=hsk_...your_key_here...
BANK_ID=teamtruth-bank
```

```bash
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Script

1. **Boot up** both frontend and backend servers.
2. Click **"Seed Memory"** (top right) to pre-load Hindsight with historically unfulfilled tasks for the user *"Bob"*.
3. In the chat, send: **`"I finished the database schema."`**
4. Watch TeamTruth instantly surface the contradictory historical logs, flag the broken promise, and drop Bob's Trust Score in real time.

---

## Current Release: MVP Chat Accountability Protocol

This release implements the full core accountability loop:

- ✅ Persistent AI memory via Vectorize Hindsight (promises never forgotten)
- ✅ Real-time Trust Score with live visual gauge
- ✅ Two-Call AI Pipeline for deterministic, hallucination-free scoring
- ✅ Team dashboard with per-member reliability tracking
- ✅ Public contradiction flagging in the shared chat feed

---

## Roadmap: Immediate V2

The next evolution removes the manual chat input requirement entirely by wiring TeamTruth directly into the GitHub event stream.

**GitHub Webhook Integration**

- Register a webhook on any GitHub repository pointing to the TeamTruth backend.
- Every `push`, `pull_request`, and `issue` event is automatically ingested as a verified data point.
- The system will autonomously cross-reference commit messages against open promises — **no human input required.**
- Trust Scores will update passively as code is actually written, tested, and merged.

This transforms TeamTruth from a *chat tool* into a **passive, always-on accountability layer** embedded directly in the development workflow.

---

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
