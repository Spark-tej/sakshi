/**
 * PrintParts Hub — Complete Backend
 * ==================================
 * npm install express mongoose bcryptjs jsonwebtoken cors multer dotenv
 * node server.js
 */

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ── Import Centralized Configuration ──────────────────────────────────────────
const { PORT, JWT_SECRET, MONGO_URI, corsOptions, uploadsDir } = require("./config");

const app = express();

// ── Ensure uploads folder exists ─────────────────────────────────────────────
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// ── Security Headers (CSP) ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https: http://localhost:*; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com cdn.tailwindcss.com https:; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https: http://localhost:*; font-src 'self' fonts.gstatic.com; frame-ancestors 'none';"
  );
  next();
});

// ── Static Files ──────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "."))); // Serve index.html and other static files

// ── Multer Storage ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(null, ok);
  },
});

// ── Schemas ───────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ["admin", "employee"], default: "employee" },
  status:     { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  department: { type: String, default: "" },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
UserSchema.methods.matchPassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

const PartSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  model:       { type: String, required: true, trim: true },
  category:    { type: String, enum: ["CTP", "Processors", "Others"], required: true },
  subcategory: { type: String, default: "" },
  description: { type: String, required: true },
  image:       { type: String, default: "" },
  imageType:   { type: String, enum: ["local", "url"], default: "url" },
  tags:        [String],
  specs:       { type: Map, of: String, default: {} },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

PartSchema.index({ name: "text", model: "text", description: "text", tags: "text" });

const User = mongoose.model("User", UserSchema);
const Part = mongoose.model("Part", PartSchema);

// ── Auth Middleware ───────────────────────────────────────────────────────────
const auth = (roles = []) => async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.status !== "approved")
      return res.status(403).json({ message: "Access denied" });
    if (roles.length && !roles.includes(user.role))
      return res.status(403).json({ message: "Insufficient permissions" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    await User.create({ name, email, password, department, role: "employee", status: "pending" });
    res.status(201).json({ message: "Registration submitted. Await admin approval." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (user.status === "pending")
      return res.status(403).json({ message: "Account pending admin approval" });
    if (user.status === "rejected")
      return res.status(403).json({ message: "Access request was rejected" });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/auth/me", auth(), (req, res) => res.json(req.user));

// ── Parts Routes ──────────────────────────────────────────────────────────────
app.get("/api/parts", auth(), async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.$text = { $search: search };
    const total = await Part.countDocuments(filter);
    const parts = await Part.find(filter)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("createdBy", "name email");
    res.json({ parts, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/parts/:id", auth(), async (req, res) => {
  try {
    const part = await Part.findById(req.params.id).populate("createdBy", "name email");
    if (!part) return res.status(404).json({ message: "Part not found" });
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/parts", auth(["admin"]), upload.single("image"), async (req, res) => {
  try {
    const { name, model, category, subcategory, description, tags, specs, imageUrl } = req.body;
    if (!name || !model || !category || !description)
      return res.status(400).json({ message: "All fields required" });

    let image = "";
    let imageType = "url";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      imageType = "local";
    } else if (imageUrl) {
      image = imageUrl;
      imageType = "url";
    }

    const part = await Part.create({
      name, model, category, subcategory: subcategory || "",
      description, image, imageType,
      tags: tags ? JSON.parse(tags) : [],
      specs: specs ? JSON.parse(specs) : {},
      createdBy: req.user._id,
    });
    res.status(201).json(part);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/parts/:id", auth(["admin"]), upload.single("image"), async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    const { name, model, category, subcategory, description, tags, specs, imageUrl, clearImage } = req.body;
    if (name) part.name = name;
    if (model) part.model = model;
    if (category) part.category = category;
    if (subcategory !== undefined) part.subcategory = subcategory;
    if (description) part.description = description;
    if (tags) part.tags = JSON.parse(tags);
    if (specs) part.specs = JSON.parse(specs);
    if (req.file) {
      // Remove old local file
      if (part.imageType === "local" && part.image) {
        const old = path.join(__dirname, part.image);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      part.image = `/uploads/${req.file.filename}`;
      part.imageType = "local";
    } else if (imageUrl) {
      part.image = imageUrl;
      part.imageType = "url";
    } else if (clearImage === "true") {
      part.image = "";
      part.imageType = "url";
    }
    await part.save();
    res.json(part);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/parts/:id", auth(["admin"]), async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ message: "Part not found" });
    if (part.imageType === "local" && part.image?.startsWith("/uploads/")) {
      const fp = path.join(__dirname, part.image);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.json({ message: "Part deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get("/api/stats", auth(), async (req, res) => {
  try {
    const [total, ctp, processors, others] = await Promise.all([
      Part.countDocuments(),
      Part.countDocuments({ category: "CTP" }),
      Part.countDocuments({ category: "Processors" }),
      Part.countDocuments({ category: "Others" }),
    ]);
    const pendingUsers = await User.countDocuments({ status: "pending" });
    const totalUsers = await User.countDocuments({ role: "employee" });
    res.json({ total, ctp, processors, others, pendingUsers, totalUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin User Management ─────────────────────────────────────────────────────
app.get("/api/admin/users", auth(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/api/admin/users/:id/status", auth(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/admin/users/:id", auth(["admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Standalone Image Upload ───────────────────────────────────────────────────
app.post("/api/upload", auth(["admin"]), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}`, type: "local" });
});

// ── SPA Catch-all (serve index.html for all non-API routes) ──────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seedUsers() {
  const adminEmail = "saiteja@mng.com";
  const empEmail   = "saiteja@engineer.com";

  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: "Saiteja Admin", email: adminEmail,
      password: "saiteja@123", role: "admin", status: "approved",
    });
    console.log("✅ Admin seeded:", adminEmail);
  }

  if (!(await User.findOne({ email: empEmail }))) {
    await User.create({
      name: "Saiteja Engineer", email: empEmail,
      password: "sai@prepress", role: "employee", status: "approved",
      department: "Pre-Press",
    });
    console.log("✅ Employee seeded:", empEmail);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedUsers();
    app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });
