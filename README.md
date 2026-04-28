# PrintParts Hub — Setup Guide

## 🔑 Login Credentials

| Role     | Email                      | Password     |
|----------|---------------------------|--------------|
| Admin    | saiteja@mng.com            | saiteja@123  |
| Engineer | saiteja@engineer.com       | sai@prepress |

---

## 📁 Files

```
printparts-backend/
├── server.js       ← Node.js + Express + MongoDB backend
├── package.json    ← Dependencies
├── index.html      ← Full React frontend (open in browser)
└── README.md       ← This file
```

---

## 🚀 Backend Setup

### 1. Install dependencies
```bash
cd printparts-backend
npm install
```

### 2. MongoDB Connection
Your MongoDB URI is already set in `server.js`:
```
mongodb+srv://saiteja:saiteja@cluster0.xwqsnmf.mongodb.net/printparts
```
Update your MongoDB Atlas password if needed.

### 3. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```
Server runs on: **http://localhost:5000**

### 4. Open the frontend
Just open `index.html` in your browser.
The frontend auto-connects to `http://localhost:5000/api`
If backend is offline, it falls back to demo sample data.

---

## 🗂️ Module Structure

### CTP — Computer to Plate
Sub-categories: Laser Units, Plates, Rollers, Motors, Optics, Pumps, Electronics, Other CTP

### Processors & Chemistry
Sub-categories: Pumps, Heaters, Rollers, Controllers, Sensors, Motors, Valves, Other Proc

### Others & Accessories
Sub-categories: UV/Exposure, Densitometry, Air/Filtration, Power Supplies, Belts/Drives, Misc

---

## 📷 Image Upload

When adding a spare part (Admin only), you can:
1. **Upload Local Image** — click to upload from your computer (JPG, PNG, WebP, max 10MB)
2. **Image URL** — paste any Google Images or web URL

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — employee registration
- `POST /api/auth/login` — login → returns JWT token
- `GET  /api/auth/me` — get current user

### Parts
- `GET    /api/parts?category=CTP&search=laser&page=1&limit=9`
- `GET    /api/parts/:id`
- `POST   /api/parts` ← Admin only, multipart/form-data (image upload)
- `PUT    /api/parts/:id` ← Admin only
- `DELETE /api/parts/:id` ← Admin only

### Admin
- `GET    /api/admin/users`
- `PATCH  /api/admin/users/:id/status` `{ status: "approved"|"rejected" }`
- `DELETE /api/admin/users/:id`

### Stats
- `GET /api/stats`

---

## ⚙️ Environment Variables (.env)

```env
MONGO_URI=mongodb+srv://saiteja:YOUR_PASSWORD@cluster0.xwqsnmf.mongodb.net/printparts
JWT_SECRET=your_very_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```
