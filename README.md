# 🚀 TeamTruth

**The Zero-Trust Accountability Agent**

Group projects fail when communication breaks down, tasks get misreported, or teammates ghost right before a deadline. Existing tools track *tasks*, but they rely on humans telling the truth. 

**TeamTruth** is different. We didn't build a task manager; we built a **Trust Engine**. 

It serves as an embedded AI teammate that cross-references chat claims against actual GitHub commit histories and logged memory to mathematically score reliability and catch broken promises before they sink your deadline.

---

## 💡 How It Works

1. **RETAIN (Memory):** Powered by **Vectorize Hindsight Cloud API**, TeamTruth securely logs every promise, claim, and deliverable made by every team member in a persistently indexed `bank_id`.
2. **RECALL (Search):** When a user drops a new update in the chat, the agent uses Hindsight to query the AI memory bank for past claims relevant to that specific user or feature.
3. **REFLECT (Inference):** Using ultra-fast inference via the **Groq Llama-3.1-8b-instant** model, TeamTruth cross-references the historical data. If it detects a contradiction or an unfulfilled pledge, it flags it instantly and deducts Trust Score points.

---

## 🛠️ The Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express.js
- **APIs & AI:** 
  - **Groq API** (Llama 3.1 8B instant)
  - **Vectorize Hindsight Cloud API**

*(Strict constraint adhered to: 100% JavaScript/Node environment. Zero Python.)*

---

## 🏃 Getting Started

### 1. Prerequisites
Ensure you have an active API Key from Groq and a valid `HINDSIGHT_API_KEY` + `BANK_ID` from the Vectorize Hindsight UI.

### 2. Backend Setup
1. Unzip the project and navigate to the `backend/` directory.
2. Install dependencies: `npm install`
3. Configure your API keys in `backend/.env`:
   ```env
   PORT=5000
   HINDSIGHT_API_KEY=hsk_...your_key_here...
   BANK_ID=teamtruth-bank
   GROQ_API_KEY=gsk_...your_key_here...
   ```
4. Start the server: `node server.js` or `npm start`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory.
2. Install dependencies via `pnpm` or `npm install`.
3. Launch the aesthetic UI: `pnpm dev` or `npm run dev`.
4. Open your browser to `http://localhost:3000`.

---

## 🎥 The "Wow" Demo 

1. Boot up both the frontend and backend. 
2. Trigger the "Seed Memory" button in the top right to pre-load Hindsight with historically unfulfilled tasks for "Bob".
3. In the chat box, send the message: **"I finished the database schema."**
4. Watch as TeamTruth instantly pulls the prior contradictory logs and publicly flags the broken promise, adjusting the real-time Trust Gauge immediately!

---

> Built for radical transparency, because no one gets the benefit of the doubt.
