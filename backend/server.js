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
// 🛡️ RATE LIMITER
// ==========================================
const requestTimes = new Map();
const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (requestTimes.has(ip) && now - requestTimes.get(ip) < 3000) {
        return res.status(429).json({ analysis: "⏳ Anti-Spam: Please wait a few seconds before sending another message.", trustEvaluation: null });
    }
    requestTimes.set(ip, now);
    next();
};

// ==========================================
// 📒 IN-MEMORY TRUST LEDGER
// ==========================================
const trustLedger = new Map();

function updateTrust(user, evaluation) {
    if (!trustLedger.has(user)) {
        trustLedger.set(user, { scores: [], current: 100 });
    }
    const ledger = trustLedger.get(user);
    ledger.scores.push({
        score: evaluation.trust_score,
        severity: evaluation.severity,
        contradiction: evaluation.contradiction_found,
        timestamp: Date.now(),
        source: evaluation.source || 'structured_output'
    });
    ledger.current = evaluation.trust_score;
    return ledger;
}

// ==========================================
// HINDSIGHT HELPERS
// ==========================================
async function recallMemories(queryText) {
    try {
        const response = await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories/recall`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HINDSIGHT_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryText })
        });
        if (!response.ok) throw new Error(`Recall Failed: ${response.status}`);
        const data = await response.json();
        return data.results && data.results.length > 0
            ? data.results.map(m => m.text).join('\n- ')
            : 'No past memories found.';
    } catch (error) {
        console.error('❌ Hindsight Error:', error.message);
        return 'Memory offline.';
    }
}

async function retainMemory(content) {
    try {
        await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HINDSIGHT_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ content }] })
        });
    } catch (error) {
        console.error('❌ Failed to retain memory:', error.message);
    }
}

// ==========================================
// 🤖 TWO-CALL ARCHITECTURE
// ==========================================

// CALL 1: Freeform Analysis
async function getAnalysis(user, message, memories) {
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 512,
        messages: [
            {
                role: 'system',
                content: `You are TeamTruth, a zero-trust accountability agent for a group project.
Analyze team member claims against stored memory. Flag contradictions clearly.
ONLY flag a contradiction if there is a DIRECT logical conflict. Normal greetings = normal response.
Be concise and specific.`
            },
            {
                role: 'user',
                content: `Team member: ${user}\nTheir claim: "${message}"\n\nMemory context:\n${memories}\n\nAnalyze this claim. Start with "⚠️ Contradiction detected." if you catch a lie.`
            }
        ]
    });
    return response.choices[0].message.content;
}

// CALL 2: Structured Trust Score (Layer 1 — json_object mode)
async function getTrustScore(user, message, memories, analysis) {
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        max_tokens: 256,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are a trust scoring engine. Output ONLY valid JSON in this exact format:
{"trust_score": 85, "contradiction_found": false, "contradiction_summary": "None", "severity": "none"}
Rules: trust_score is 0-100, severity is one of "none","minor","major","critical". No extra text.`
            },
            {
                role: 'user',
                content: `Team member: ${user}\nClaim: "${message}"\nMemories: ${memories}\nAnalysis: ${analysis}\n\nScore this.`
            }
        ]
    });
    return JSON.parse(response.choices[0].message.content);
}

// Layer 3: keyword-based fallback (mirrors frontend utility)
function estimateTrustFromText(text = '') {
    const t = text.toLowerCase();
    let score = 100, contradictionFound = false, severity = 'none';
    const critical = ['fabricat', 'caught lying', 'directly contradicts', 'proven false'];
    const major = ['contradict', 'inconsistent', 'conflicts with', "doesn't match", 'discrepancy'];
    const minor = ['unclear', 'vague', 'unverified', 'no evidence', 'cannot confirm'];
    for (const w of critical) { if (t.includes(w)) { score -= 40; contradictionFound = true; severity = 'critical'; } }
    for (const w of major)    { if (t.includes(w)) { score -= 25; contradictionFound = true; if (severity === 'none') severity = 'major'; } }
    for (const w of minor)    { if (t.includes(w)) { score -= 10; if (severity === 'none') severity = 'minor'; } }
    return { trust_score: Math.max(0, Math.min(100, score)), contradiction_found: contradictionFound, contradiction_summary: contradictionFound ? 'Detected via keyword analysis.' : 'None', severity, source: 'server_fallback' };
}

// ==========================================
// ENDPOINTS
// ==========================================

app.post('/api/chat', rateLimitMiddleware, async (req, res) => {
    const { user, message } = req.body;
    if (!message || !user) return res.status(400).json({ error: 'Missing user or message.' });

    try {
        const memories = await recallMemories(message);

        // Call 1: Freeform analysis
        const analysis = await getAnalysis(user, message, memories);

        // Call 2: Structured score — with fallback chain
        let trustEvaluation;
        try {
            trustEvaluation = await getTrustScore(user, message, memories, analysis);
            trustEvaluation.source = 'json_mode';
        } catch (err) {
            console.warn('⚠️ Structured scoring failed, using server keyword fallback:', err.message);
            trustEvaluation = estimateTrustFromText(analysis);
        }

        // Layer 4: Sanity check
        if (typeof trustEvaluation.trust_score !== 'number' || trustEvaluation.trust_score < 0 || trustEvaluation.trust_score > 100) {
            trustEvaluation = estimateTrustFromText(analysis);
        }

        const ledger = updateTrust(user, trustEvaluation);

        await retainMemory(
            `${user} stated: "${message}" | Trust: ${trustEvaluation.trust_score}% | Contradiction: ${trustEvaluation.contradiction_found ? 'YES - ' + trustEvaluation.contradiction_summary : 'No'}`
        );

        res.json({
            // Legacy field so old frontend code still works
            response: analysis,
            // New structured fields
            analysis,
            trustEvaluation,
            trustScore: trustEvaluation.trust_score,
            userTrustHistory: {
                current: ledger.current,
                totalChecks: ledger.scores.length,
                trend: ledger.scores.slice(-5).map(s => s.score)
            }
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ response: 'Brain malfunction.', analysis: 'Brain malfunction.' });
    }
});

// SEED ENDPOINT (Full Team Roster)
app.post('/api/memory/seed', async (req, res) => {
    try {
        await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HINDSIGHT_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [
                    { content: 'Project Assignment: Bob is strictly assigned to build the Database Schema.' },
                    { content: 'Project Assignment: Alice is strictly assigned to build the React Frontend UI.' },
                    { content: 'Project Assignment: Charlie is strictly assigned to handle the API integrations and Node.js backend.' },
                    { content: 'Project Assignment: Diana is strictly assigned to write the pitch script and prepare the presentation deck.' },
                    { content: "On Tuesday, Bob stated: 'I will finish the database schema by tomorrow.'" },
                    { content: 'System Log: As of Thursday, the GitHub repository shows 0 commits from Bob related to the database.' }
                ]
            })
        });
        res.json({ success: true, message: 'Seeded full team: Bob, Alice, Charlie, Diana.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to seed.' });
    }
});

// MEMORIES ENDPOINT — Dynamic Score from Ledger
app.get('/api/memories/:user', async (req, res) => {
    try {
        const user = req.params.user;
        const memories = await recallMemories(user);
        const ledger = trustLedger.get(user);
        const dynamicScore = ledger ? ledger.current : 100;
        res.json({ success: true, memories: [{ content: memories }], trustScore: dynamicScore });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch memories.' });
    }
});

// CLEAR ENDPOINT
app.post('/api/memory/clear', async (req, res) => {
    trustLedger.clear();
    await retainMemory('SYSTEM OVERRIDE: PROJECT RESET. Ignore all previous claims and lies. Start fresh.');
    res.json({ success: true, message: 'Memory Context and Trust Ledger cleared.' });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ status: 'TeamTruth Backend is live', hindsight: 'Connected', groq: 'Connected' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🔍 TeamTruth Backend [4-Layer Defense] ║
║   → http://localhost:${PORT}               ║
║   → POST /api/chat  (2-call + fallbacks) ║
║   → POST /api/memory/seed                ║
║   → POST /api/memory/clear               ║
║   → GET  /api/memories/:user             ║
╚══════════════════════════════════════════╝
    `);
});
