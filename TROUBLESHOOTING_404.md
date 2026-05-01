# 🔧 Troubleshooting: App Not Working on Other Devices

## Current Issue
Getting **404 errors** when accessing the app on another device/laptop.

## ✅ What I Fixed
1. **vercel.json routing** - Improved route patterns for static files and API
2. **Static file serving** - Set `"public": "."` to serve all root files
3. **API routes** - Added HTTP methods support for all REST operations
4. **Index.html fallback** - Configured to serve index.html for SPA navigation

## ⏳ Deployment Status
✅ Changes pushed to GitHub  
⏳ Vercel is auto-redeploying (usually 2-5 minutes)

---

## 🧪 Testing Steps on the Other Device

### Step 1: Wait for Deployment (5 min)
Go to: https://vercel.com/maddirala-sris-projects/2604/deployments
- Check for a new deployment with status "Ready" ✓

### Step 2: Test Basic Access
Open: https://2604-theta.vercel.app
- ✅ Should see the PrintParts Hub admin panel
- ✅ Page should load (not blank, not 404)

### Step 3: Test API Endpoints
Open browser DevTools (F12 → Network tab), then try:

**GET `/api/parts`** (Fetch parts list)
```bash
# In browser console, run:
fetch('https://2604-theta.vercel.app/api/parts')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected:** Array of parts with MongoDB data ✓

### Step 4: Check for Errors
In browser DevTools (F12 → Console):
- Look for red errors
- Look for CORS errors
- Look for 404 messages

---

## 🔍 Common 404 Issues & Solutions

### Issue: 404 on root URL
**Symptom:** GET / returns 404  
**Cause:** vercel.json not routing correctly  
**Fix:** ✅ Applied in latest deployment

### Issue: 404 on `/api/parts`  
**Symptom:** API calls return 404  
**Cause:** api/index.js not exporting correctly  
**Check:** Module exports app: `module.exports = app;` ✓

### Issue: 404 on other static files
**Symptom:** index.html, CSS, JS files return 404  
**Cause:** Missing files or wrong public directory  
**Check:**
```bash
# These files must exist in root:
ls -la index.html config.js package.json
```

---

## 📋 What Should Happen Now

### On localhost (your machine):
```
http://localhost:5000
│
├── ✅ index.html loads
├── ✅ API: http://localhost:5000/api/parts works
└── ✅ MongoDB data shows
```

### On Vercel (other devices):
```
https://2604-theta.vercel.app
│
├── ✅ index.html loads (served by Vercel static)
├── ✅ API: https://2604-theta.vercel.app/api/parts (serverless function)
└── ✅ MongoDB data shows (if MONGO_URI env var is set)
```

---

## 🎯 Environment Variables Check

Go to: https://vercel.com/maddirala-sris-projects/2604/settings/environment-variables

**Must be set:**
- [ ] `MONGO_URI` = Your MongoDB connection string
- [ ] `JWT_SECRET` = Your secret key
- [ ] `NODE_ENV` = production

**If missing, add them now!**

---

## 💻 Advanced Debugging (if still 404)

### Check Vercel Build Logs
1. Go to: https://vercel.com/maddirala-sris-projects/2604/deployments
2. Click latest deployment
3. Check "Build & Deploy" logs for errors

### Check Function Errors
1. Go to: https://vercel.com/maddirala-sris-projects/2604/functions
2. Look for `/api/index.js` function
3. Check for runtime errors

### Manually Test with curl
```bash
# Test from your machine (Windows PowerShell)
$url = "https://2604-theta.vercel.app/"
Invoke-WebRequest -Uri $url -Verbose

# Should return HTML content, not 404
```

---

## 🚀 If Everything Works Now

1. ✅ App loads on other device → **Celebrate!** 🎉
2. ✅ API data shows → **Full stack working!** 💪
3. ✅ No errors in console → **Production ready!** 🚀

---

## Still Not Working? Check This

```javascript
// Test in browser console:

// 1. Check API base URL detection
console.log("Host:", window.location.host);
console.log("API_BASE should be:", 
  window.location.host.includes("vercel.app") 
    ? `https://${window.location.host}/api`
    : "http://localhost:5000/api"
);

// 2. Test API connection
fetch('https://2604-theta.vercel.app/api/parts')
  .then(r => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then(d => console.log("Data:", d))
  .catch(e => console.error("Error:", e));

// 3. Check CORS headers
fetch('https://2604-theta.vercel.app/api/parts', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
  .then(r => {
    console.log("Headers:", r.headers);
    return r.text();
  })
  .catch(e => console.error("CORS Error:", e));
```

---

## 📞 Next Steps

1. **Wait 5 minutes** for Vercel to finish deploying
2. **Test on other device** using URL: https://2604-theta.vercel.app
3. **Check browser console** (F12) for errors
4. **Tell me if:**
   - ✅ Page loads → Issue solved!
   - ❌ Still 404 → Check env variables
   - ❌ API errors → Check MongoDB connection

---

**Created:** May 1, 2026  
**Status:** Waiting for Vercel deployment  
**Next deployment:** Auto-triggered from git push ✅
