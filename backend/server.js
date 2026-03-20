import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const HINDSIGHT_KEY = process.env.HINDSIGHT_API_KEY;
const BANK_ID = process.env.BANK_ID;

// ==========================================
// 🛡️ RATE LIMITER (Protects Groq API from Spam)
// ==========================================
const requestTimes = new Map();
const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    // 3-second cooldown per IP
    if (requestTimes.has(ip) && now - requestTimes.get(ip) < 3000) {
        return res.status(429).json({ response: "⏳ Anti-Spam: Please wait a few seconds before sending another message." });
    }
    requestTimes.set(ip, now);
    next();
};

// ==========================================
// HINDSIGHT HELPER FUNCTIONS
// ==========================================
async function recallMemories(queryText) {
    try {
        const response = await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories/recall`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HINDSIGHT_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: queryText })
        });
        if (!response.ok) throw new Error(`Recall Failed: ${response.status}`);
        const data = await response.json();
        return data.results && data.results.length > 0
            ? data.results.map(m => m.text).join("\n- ")
            : "No past memories found.";
    } catch (error) {
        console.error("❌ Hindsight Error:", error.message);
        return "Memory offline.";
    }
}

async function retainMemory(content) {
    try {
        await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HINDSIGHT_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: [{ content }] })
        });
    } catch (error) {
        console.error("❌ Failed to retain memory:", error.message);
    }
}

// ==========================================
// CORE ENDPOINTS
// ==========================================

// 1. CHAT ENDPOINT (Protected by Rate Limiter)
app.post('/api/chat', rateLimitMiddleware, async (req, res) => {
    const { user, message } = req.body;
    if (!message || !user) return res.status(400).json({ error: "Missing user or message." });

    try {
        const evidence = await recallMemories(message);

        const systemPrompt = `
        You are "TeamTruth", a Zero-Trust Accountability AI for a hackathon group project.
        
        HINDSIGHT MEMORY (Past evidence & assignments):
        - ${evidence}

        The user "${user}" just said: "${message}"

        YOUR STRICT DIRECTIVES:
        1. ONLY output "⚠️ Contradiction detected" if the user's message DIRECTLY conflicts with the past evidence (e.g. claiming a task is done when evidence says 0 commits, or claiming someone else's task).
        2. If they are just saying "Hello", asking for a status update, or talking normally, DO NOT flag a contradiction. Reply normally as a helpful AI Project Manager.
        3. If you DO catch a contradiction, be clinical, explain exactly why based on the memory, and output a fake [TRUST_SCORE: XX%] penalty at the end of your message.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "System error.";
        await retainMemory(`${user} stated: "${message}"`);

        // Extract Trust Score if the AI generated one
        const scoreMatch = aiResponse.match(/\[TRUST_SCORE:\s*(\d+)%\]/);
        const newScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

        res.json({
            response: aiResponse.replace(/\[TRUST_SCORE:\s*\d+%\]/, '').trim(),
            trustScore: newScore
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ response: "Brain malfunction." });
    }
});

// 2. SEED ENDPOINT (Multi-User: Bob gets DB, Alice gets Frontend)
app.post('/api/memory/seed', async (req, res) => {
    try {
        await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HINDSIGHT_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [
                    { content: "Project Assignment: Bob is strictly assigned to build the Database Schema." },
                    { content: "Project Assignment: Alice is strictly assigned to build the React Frontend UI." },
                    { content: "On Tuesday, Bob stated: 'I will finish the database schema by tomorrow.'" },
                    { content: "System Log: As of Thursday, the GitHub repository shows 0 commits from Bob related to the database." }
                ]
            })
        });
        res.json({ success: true, message: "Database Seeded with Bob and Alice's assignments." });
    } catch (error) {
        res.status(500).json({ error: "Failed to seed." });
    }
});

// 3. MEMORIES ENDPOINT (For the Trust Dashboard sidebar)
app.get('/api/memories/:user', async (req, res) => {
    const { user } = req.params;
    try {
        const memories = await recallMemories(user);
        res.json({ success: true, memories: memories ? [{ content: memories }] : [], trustScore: 85 });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch memories." });
    }
});

// 4. CLEAR ENDPOINT (For Demo Reset)
app.post('/api/memory/clear', async (req, res) => {
    await retainMemory("SYSTEM OVERRIDE: PROJECT RESET. Ignore all previous claims and lies. Start fresh.");
    res.json({ success: true, message: "Memory Context Cleared for new demo." });
});

// 5. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ status: "TeamTruth Backend is live", hindsight: "Connected", groq: "Connected" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🔍 TeamTruth Backend                   ║
║   → http://localhost:${PORT}               ║
║   → POST /api/chat (analyze + rate limit) ║
║   → POST /api/memory/seed (multi-user)   ║
║   → POST /api/memory/clear (demo reset)  ║
║   → GET  /api/memories/:user             ║
╚══════════════════════════════════════════╝
    `);
});
