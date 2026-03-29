# 🧪 Step 2 Testing Guide: True Reset Verification

## What Was The Bug? 🐛

**BEFORE Step 2:**
- `/api/memory/clear` injected a fake "SYSTEM OVERRIDE: PROJECT RESET" message into Hindsight
- This polluted the LLM context window over time
- The memory graph was never actually cleared, just contaminated with override strings
- Result: Context pollution accumulates ❌

**AFTER Step 2:**
- `/api/memory/clear` executes the actual Hindsight `DELETE /banks/{bank_id}/memories` API
- The memory graph is legitimately wiped clean
- No fake messages, no context pollution
- Result: True fresh start ✅

---

## 🧪 How To Test The Fix

### Step 1: Restart the Backend Server
```bash
# Stop the current server (Ctrl+C in the terminal)
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

### Step 2: Seed Memory Bank
```bash
curl -X POST http://localhost:5000/api/memory/seed
```

Expected response:
```json
{"success":true,"message":"Seeded full team: Bob, Alice, Charlie, Diana."}
```

---

### Step 3: Verify Memory Exists (Bob)
```bash
curl http://localhost:5000/api/memories/Bob
```

You should see Bob's memories in the response.

---

### Step 4: Execute TRUE RESET
```bash
curl -X POST http://localhost:5000/api/memory/clear
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Memory bank and Trust Ledger completely cleared.",
  "method": "hindsight_delete_api"
}
```

**Backend Console Should Show:**
```
✅ Memory bank wiped clean — no context pollution
```

---

### Step 5: Verify Memory is ACTUALLY Deleted
```bash
curl http://localhost:5000/api/memories/Bob
```

**Expected Result:**
- Should return "No past memories found." or empty memories
- NO "SYSTEM OVERRIDE" pollution messages
- Clean slate

---

### Step 6: Test Re-Seeding After Clear
```bash
# Seed again
curl -X POST http://localhost:5000/api/memory/seed

# Send a test message
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"user\": \"Bob\", \"message\": \"I finished the database\"}"
```

**Expected Result:**
- Should work normally
- No contamination from previous sessions
- Fresh context

---

## 🎯 What To Look For

### ✅ SUCCESS INDICATORS:
1. **DELETE API is called** (check backend logs)
2. **Memory is actually wiped** (not just overridden)
3. **No "SYSTEM OVERRIDE" messages** in the memory bank
4. **Clean re-seeding** works after reset
5. **Response includes** `"method": "hindsight_delete_api"`

### ❌ FAILURE INDICATORS (Old Bug):
1. Memory still contains old data after clear
2. "SYSTEM OVERRIDE" messages appear in memories
3. Context pollution accumulates over multiple resets
4. DELETE API is not called

---

## 🔍 Backend Logs To Watch

In your server terminal, you should see:
```
✅ Memory bank wiped clean — no context pollution
```

If there's an error:
```
❌ Failed to clear memory bank: [error details]
```

---

## 📊 API Response Comparison

### OLD (Fake Reset):
```json
{
  "success": true,
  "message": "Memory Context and Trust Ledger cleared."
}
```
- No indication of actual deletion
- Memory still contains "SYSTEM OVERRIDE" pollution

### NEW (True Reset):
```json
{
  "success": true,
  "message": "Memory bank and Trust Ledger completely cleared.",
  "method": "hindsight_delete_api"
}
```
- Explicit confirmation of DELETE API usage
- Memory is legitimately empty

---

## ✅ Confirmation Checklist

- [ ] Backend server restarts without errors
- [ ] Seed endpoint populates memory
- [ ] Clear endpoint returns success with `"method": "hindsight_delete_api"`
- [ ] Backend logs show "✅ Memory bank wiped clean"
- [ ] Memory fetch after clear returns empty/no memories
- [ ] No "SYSTEM OVERRIDE" pollution in memory bank
- [ ] Re-seeding after clear works normally

**Once all checkboxes are ✅, Step 2 is complete!**

---

## 🔧 Troubleshooting

### If DELETE fails:
1. Check Hindsight API key is valid
2. Verify BANK_ID is correct
3. Check network connectivity
4. Review Hindsight API documentation for DELETE endpoint

### Error Response Example:
```json
{
  "success": false,
  "error": "Failed to clear memory bank",
  "details": "Hindsight DELETE failed: 401"
}
```
