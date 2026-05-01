# ✅ QUICK FIX CHECKLIST - Fix 404 Errors

## 🎯 Action Plan (5-10 minutes)

### Step 1: Set Vercel Environment Variables ⚡
**Time: 2 minutes**

1. Go to: https://vercel.com/maddirala-sris-projects/2604/settings/environment-variables

2. Make sure these are set:
   ```
   MONGO_URI=mongodb+srv://saiteja:saiteja@cluster0.xwqsnmf.mongodb.net/printparts
   JWT_SECRET=printparts_secret_2024
   NODE_ENV=production
   ```

3. If missing, click **"Add"** and enter them

4. ✅ Click **"Save"** (Vercel auto-redeploys)

---

### Step 2: Wait for Deployment 🔄
**Time: 5 minutes**

1. Go to: https://vercel.com/maddirala-sris-projects/2604/deployments

2. Look for latest deployment (should say "Ready" ✓ with green checkmark)

3. When it shows "Ready", go to Step 3

---

### Step 3: Test the App 🧪
**Time: 2 minutes**

**On the other device, open:**
```
https://2604-theta.vercel.app
```

**Should see:**
- ✅ PrintParts Hub logo and header
- ✅ "All Spare Parts" section showing parts
- ✅ No white screen or 404 error

---

### Step 4: If Still 404 - Check These 🔍

#### Check A: MongoDB Connection
```bash
Go to: https://vercel.com/maddirala-sris-projects/2604/functions
Click: /api/index.js
Look for: MongoDB connection errors
```

#### Check B: Browser Console
On the other device:
1. Press **F12** (or Right-click → Inspect)
2. Go to **Console** tab
3. Look for red errors
4. Copy error message and show me

#### Check C: API Endpoint Test
In browser console on the other device:
```javascript
fetch('https://2604-theta.vercel.app/api/parts')
  .then(r => r.json())
  .then(d => console.log("Data:", d))
  .catch(e => console.error("Error:", e))
```

**Should show:** Array of parts (not error)

---

## 🎯 Expected Results

| Component | Expected | Status |
|-----------|----------|--------|
| Page Loads | index.html renders | ⏳ |
| API URL | `https://2604-theta.vercel.app/api` | ⏳ |
| MongoDB Data | Parts array loads | ⏳ |
| Browser Console | No red errors | ⏳ |

---

## 🚨 If Still Not Working

**Send me:**
1. Screenshot of browser console error (F12)
2. URL you're trying to access
3. What error you see (404, CORS, blank page, etc.)

---

## ✨ What I Already Fixed

✅ vercel.json routing corrected  
✅ Static file serving enabled  
✅ API routes setup for serverless  
✅ Index.html fallback configured  
✅ API URL auto-detection working  

**Latest deployment:** Just pushed (auto-deploying now)

---

**Key URL:** https://2604-theta.vercel.app  
**Do NOT** use the full deployment URL with random suffix  
**Always** use: 2604-theta.vercel.app (the alias)

---

**Status:** ⏳ Waiting for Vercel deployment (5 min)  
**Next:** Test the app on other device
