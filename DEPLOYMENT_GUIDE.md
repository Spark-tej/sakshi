# Vercel Deployment Guide for PrintParts Hub

## ✅ Issues Fixed

1. **Hardcoded localhost URL** → Now dynamically detects environment
2. **CORS blocked Vercel requests** → Updated to allow Vercel domains
3. **MongoDB not connecting in production** → Environment variables properly configured

---

## 🚀 Deployment Setup Instructions

### Step 1: Set Vercel Environment Variables

Go to your Vercel dashboard: https://vercel.com/maddirala-sris-projects/2604

**Settings → Environment Variables** and add:

```
MONGO_URI=mongodb+srv://saiteja:saiteja@cluster0.xwqsnmf.mongodb.net/printparts
JWT_SECRET=printparts_secret_2024
NODE_ENV=production
```

### Step 2: Verify vercel.json Configuration

Your `vercel.json` should look like this:

```json
{
  "version": 2,
  "buildCommand": "echo 'build complete'",
  "outputDirectory": ".",
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "routes": [
    {
      "src": "/api/?(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/uploads/?(.*)",
      "dest": "/tmp/uploads/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html",
      "status": 200
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"]
}
```

### Step 3: How the API URL Detection Works

In `index.html`, the API base URL now automatically detects the environment:

```javascript
const API_BASE = (() => {
  const host = window.location.host;
  
  // Development: http://localhost:5000
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "http://localhost:5000/api";
  }
  
  // Production: https://2604-theta.vercel.app
  if (host.includes("vercel.app")) {
    return `https://${host}/api`;
  }
  
  // Fallback
  return `${window.location.protocol}//${host}/api`;
})();
```

### Step 4: Full-Stack Deployment Architecture

```
Your Vercel Deployment (2604-theta.vercel.app)
├── Frontend: index.html (served as static)
├── API Routes: /api/*(served by api/index.js)
└── Database: MongoDB (external connection)

Request Flow:
Frontend → https://2604-theta.vercel.app/api/parts
           ↓
       api/index.js (Vercel serverless function)
           ↓
       MongoDB Atlas (production database)
```

### Step 5: Testing the Deployment

1. **Open your Vercel app**: https://2604-theta.vercel.app

2. **Check browser console (F12)** to verify:
   - ✅ API base URL is correct
   - ✅ MongoDB data loads
   - ✅ No CORS errors

3. **Monitor Vercel logs**:
   ```bash
   vercel logs --prod
   ```

---

## 🔧 Local Development vs Production

### Local (localhost:5000)
```javascript
API_BASE = "http://localhost:5000/api"
Backend:  node server.js
```

### Production (Vercel)
```javascript
API_BASE = "https://2604-theta.vercel.app/api"
Backend:  api/index.js (serverless function)
Database: MongoDB Atlas (via MONGO_URI env var)
```

---

## 🐛 Troubleshooting

### Problem: MongoDB data not showing

**Solution:**
1. Verify `MONGO_URI` is set in Vercel environment variables
2. Check MongoDB Atlas IP whitelist (should include Vercel IPs or set to 0.0.0.0/0)
3. Check MongoDB connection status:
   ```bash
   vercel env pull .env.local
   ```

### Problem: CORS errors in browser console

**Solution:**
Your origin is now automatically allowed. If still blocked:
1. Check `api/index.js` corsOptions function
2. Add your domain if using custom domain:
   ```javascript
   const isProduction = origin && (origin.includes("yourdomain.com"));
   ```

### Problem: API endpoints returning 404

**Solution:**
1. Verify vercel.json routes are correct
2. Check api/index.js exports the app:
   ```javascript
   module.exports = app;
   ```

### Problem: Uploads/files not persisting

**Solution:**
Vercel serverless functions use ephemeral storage. Use MongoDB GridFS or external storage:
```javascript
// Use MongoDB for file storage instead of local disk
const fileSchema = new mongoose.Schema({
  filename: String,
  data: Buffer,
  mimetype: String,
});
```

---

## 📋 Deployment Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] `MONGO_URI` points to production MongoDB
- [ ] `JWT_SECRET` is strong and secure
- [ ] `vercel.json` has correct routes
- [ ] Frontend API calls use dynamic `API_BASE`
- [ ] CORS allows your Vercel domain
- [ ] MongoDB IP whitelist includes 0.0.0.0/0 or Vercel IPs
- [ ] Test API endpoints in production
- [ ] Check Vercel logs for errors

---

## 📚 Useful Commands

```bash
# Deploy to production
vercel --prod

# Check environment variables
vercel env pull .env.local

# View production logs
vercel logs --prod

# Preview deployment
vercel preview

# Redeploy latest
vercel --prod --force
```

---

## 🔐 Security Notes

- Never commit `.env` or secrets to git
- Use Vercel environment variables for sensitive data
- Change `JWT_SECRET` to a random strong string
- Restrict MongoDB IP whitelist to Vercel IPs in production
- Use HTTPS only (enforced by Vercel)

---

## 🎯 Next Steps

1. ✅ Code changes applied (API URL, CORS)
2. ⏭️ Push to GitHub: `git add -A && git commit -m "Fix production deployment" && git push`
3. ⏭️ Vercel auto-redeploys on push
4. ⏭️ Test your app at https://2604-theta.vercel.app
5. ⏭️ Check browser console and Vercel logs

---

**Need help?** Check:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Express CORS: https://expressjs.com/en/resources/middleware/cors.html
