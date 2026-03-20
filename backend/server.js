import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const HINDSIGHT_KEY = process.env.HINDSIGHT_API_KEY;
const BANK_ID = process.env.BANK_ID;

// ==========================================
// HINDSIGHT HELPER FUNCTIONS (The Brain)
// ==========================================

// 1. RECALL: Fetch relevant memories from Hindsight
async function recallMemories(queryText) {
    try {
        console.log(`🧠 Recalling memories for: "${queryText}"`);
        
        // 🔥 FIXED: The correct Hindsight Cloud endpoint is /memories/recall
        const response = await fetch(`https://api.hindsight.vectorize.io/v1/default/banks/${BANK_ID}/memories/recall`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HINDSIGHT_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: queryText
            })
        });

        if (!response.ok) throw new Error(`Hindsight Recall Failed: ${response.status}`);
        
        const data = await response.json();
        
        // Map the results text (Hindsight returns an array of results)
        const memoryContext = data.results && data.results.length > 0 
            ? data.results.map(m => m.text).join("\n- ") 
            : "No past memories found.";
            
        return memoryContext;

    } catch (error) {
        console.error("❌ Hindsight Error:", error.message);
        return "Memory offline.";
    }
}

// 2. RETAIN: Save new chats to Hindsight permanently
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
        console.log(`💾 Retained new memory: "${content}"`);
    } catch (error) {
        console.error("❌ Failed to retain memory:", error.message);
    }
}

// ==========================================
// CORE MVP ENDPOINTS
// ==========================================

// THE "WOW" DEMO ENDPOINT
app.post('/api/chat', async (req, res) => {
    const { user, message } = req.body;

    if (!message || !user) {
        return res.status(400).json({ error: "Missing user or message." });
    }

    try {
        // Step 1: RECALL past evidence
        const evidence = await recallMemories(message);

        // Step 2: REFLECT (Groq LLM identifies contradictions)
        const systemPrompt = `
        You are "TeamTruth", a Zero-Trust Accountability Agent for a group project.
        You monitor team chat to catch broken promises, missed deadlines, and lies.
        
        Here is the HINDSIGHT MEMORY (Past evidence):
        - ${evidence}

        The user "${user}" just said: "${message}"

        YOUR DIRECTIVE:
        If their current message contradicts the past evidence, call them out immediately. 
        Start your message with "⚠️ Contradiction detected." Be clinical, direct, and calculate a fake "Trust Score" penalty.
        If there is no contradiction, acknowledge their message normally.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            // 🔥 FIXED: Swapped to the active Llama 3.1 model
            model: "llama-3.1-8b-instant", 
            temperature: 0.2, 
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "System error.";

        // Step 3: RETAIN the new claim
        await retainMemory(`${user} stated: "${message}"`);

        // Step 4: Respond to frontend
        res.json({ 
            response: aiResponse,
            memoriesUsed: evidence 
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Brain malfunction." });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: "TeamTruth Backend is live", hindsight: "Connected", groq: "Connected" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 TeamTruth API running on http://localhost:${PORT}`);
});
