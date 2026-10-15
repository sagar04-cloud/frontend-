/**
 * ==============================================================================
 * FRONTEND ENVIRONMENT CONFIGURATION (Browser .env Equivalent)
 * ==============================================================================
 * Because pure browser applications (HTML/Vanilla JS) cannot read a raw ".env"
 * file directly without a server or build bundler, this file serves as the
 * environment variables file for the frontend.
 *
 * SETTINGS:
 * - Local Development:
 *   Leave API_BASE_URL empty ("") or set to "http://localhost:5000"
 *
 * - Production on Railway & Vercel:
 *   Set API_BASE_URL to your public Railway domain:
 *   Example: "https://fb-backend-production-xxxx.up.railway.app"
 * ==============================================================================
 */

export const env = {
  // Public Backend API URL (Railway)
  API_BASE_URL: "",

  // Environment mode ("development" | "production")
  NODE_ENV: "development",

  // App Metadata
  APP_NAME: "FB Connect",
  APP_VERSION: "1.0.0",

  // Feature Flags
  ENABLE_ANALYTICS: true,
  HEALTH_CHECK_INTERVAL_MS: 10000
};

// Aliases for compatibility
export const CONFIG = {
  get RAILWAY_BACKEND_URL() {
    return env.API_BASE_URL;
  }
};

export default env;
