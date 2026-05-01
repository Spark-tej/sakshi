/**
 * API Configuration
 * Centralized config for both localhost and Vercel deployment
 */

// ── Environment Detection ─────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === 'true' || process.env.VERCEL_URL;

// ── Database Configuration ────────────────────────────────────────────────────
const MONGO_URI = 
  process.env.MONGO_URI || 
  process.env.MONGODB_URI || 
  'mongodb+srv://saiteja:saiteja@cluster0.xwqsnmf.mongodb.net/printparts';

// ── Security Configuration ────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'printparts_secret_2024';

// ── Server Configuration ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// ── CORS Configuration ────────────────────────────────────────────────────────
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];

  // Add custom domains
  if (process.env.CUSTOM_DOMAIN) {
    baseOrigins.push(`https://${process.env.CUSTOM_DOMAIN}`);
    baseOrigins.push(`https://www.${process.env.CUSTOM_DOMAIN}`);
  }

  return baseOrigins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow Vercel preview and production deployments
    const isVercelApp = origin && origin.includes('.vercel.app');
    const isAllowed = !origin || allowedOrigins.includes(origin) || isVercelApp;
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ── File Storage Configuration ────────────────────────────────────────────────
const uploadsDir = isVercel 
  ? '/tmp/uploads'  // Use /tmp for Vercel serverless
  : './uploads';    // Use local folder for development

// ── Export Configuration ──────────────────────────────────────────────────────
module.exports = {
  isProduction,
  isVercel,
  MONGO_URI,
  JWT_SECRET,
  PORT,
  corsOptions,
  uploadsDir,
  getAllowedOrigins,
};
