# 🧪 Step 1 Testing Guide: Context Fix Verification

## What Was The Bug? 🐛

**BEFORE Step 1:**
- When Bob sent a message about "database", the system queried Hindsight with just: `"I finished the database"`
- This recalled ALL database-related memories from EVERYONE (Bob, Alice, Charlie, Diana)
- Result: Bob got penalized for Alice's broken database promises ❌

**AFTER Step 1:**
- When Bob sends a message, the system queries: `"[User: Bob] Claim: I finished the database"`
- This recalls ONLY Bob's historical claims
- Result: Bob only gets judged on Bob's history ✅

---

## 🧪 How To Test The Fix

### Step 1: Restart the Backend Server
```bash
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
cd backend
node server.js
```

You should see:
```
╔══════════════════════════════════════════╗
║   🔍 TeamTruth Backend [4-Layer Defense] ║
║   → http://localhost:5000               ║
╚══════════════════════════════════════════╝
```

---

### Step 2: Seed The Memory Bank
Open a new terminal and run:
```bash
curl -X POST http://localhost:5000/api/memory/seed
```

This creates test data:
- Bob is assigned to Database Schema
- Alice is assigned to React Frontend
- Bob promised to finish database by tomorrow
- GitHub shows 0 commits from Bob

---

### Step 3: Test Bob's Claim (Should Flag Contradiction)
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"user\": \"Bob\", \"message\": \"I finished the database schema yesterday\"}"
```

**Expected Result:**
- ⚠️ Should detect contradiction (Bob promised to finish but has 0 commits)
- Trust score should DROP (around 40-60)
- Analysis should mention Bob's broken promise

---

### Step 4: Test Alice's Claim (Should NOT Be Affected by Bob)
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"user\": \"Alice\", \"message\": \"I'm working on the React components\"}"
```

**Expected Result:**
- ✅ Should be CLEAN (no contradiction)
- Trust score should be HIGH (85-100)
- Alice is NOT penalized for Bob's database lies
- **THIS IS THE KEY TEST** - Before Step 1, Alice might have been flagged because the system recalled Bob's database memories

---

### Step 5: Test Charlie (Fresh User)
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"user\": \"Charlie\", \"message\": \"I'm handling the API integrations\"}"
```

**Expected Result:**
- ✅ Clean slate, high trust score
- No memory bleeding from Bob or Alice

---

## 🎯 What To Look For

### ✅ SUCCESS INDICATORS:
1. **Bob gets flagged** for his own broken database promise
2. **Alice stays clean** despite Bob's database lies (no memory bleeding)
3. **Charlie starts fresh** with no contamination
4. Each user's trust score is independent

### ❌ FAILURE INDICATORS (Old Bug):
1. Alice gets flagged when mentioning "database" (contaminated by Bob's memories)
2. Users share trust scores
3. Cross-user memory contamination

---

## 📊 Check The Response Format

Each response should include:
```json
{
  "analysis": "AI's freeform analysis",
  "trustEvaluation": {
    "trust_score": 45,
    "contradiction_found": true,
    "contradiction_summary": "...",
    "severity": "major"
  },
  "trustScore": 73,  // Rolling average
  "userTrustHistory": {
    "current": 73,
    "totalChecks": 1,
    "trend": [45]
  }
}
```

---

## 🔍 Backend Logs To Watch

In your server terminal, you should see:
- No "Hindsight Error" messages (memory recall working)
- No "Structured scoring failed" warnings (JSON mode working)
- Clean API calls to Groq

---

## ✅ Confirmation Checklist

- [ ] Backend server starts without errors
- [ ] Seed endpoint returns success
- [ ] Bob's claim triggers contradiction (trust score drops)
- [ ] Alice's claim stays clean (trust score high)
- [ ] Charlie starts fresh (no contamination)
- [ ] No cross-user memory bleeding observed

**Once all checkboxes are ✅, confirm with me and I'll proceed to Step 2!**
