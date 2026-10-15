/**
 * ==============================================================================
 * FRONTEND ENVIRONMENT CONFIGURATION (Browser .env Equivalent)
 * ==============================================================================
 * Because pure browser applications (HTML/Vanilla JS) cannot read a raw ".env"
 * file directly without a server or build bundler, this file serves as the
 * environment variables file for the frontend.
 * ==============================================================================
 */

export const env = {
  // Public Backend API URL (Connected to Railway)
  API_BASE_URL: "https://backend-production-d9f3.up.railway.app",

  // Environment mode ("development" | "production")
  NODE_ENV: "production",

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
