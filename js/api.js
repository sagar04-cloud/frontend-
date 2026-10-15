/**
 * FB Application API Client
 * Manages communication with the Express backend service,
 * supporting dynamic Railway cloud backend connection, local development,
 * and persistent URL overrides via localStorage.
 */

import { env } from "./env.js";

function resolveApiBase() {
  // 1. Check if user configured a custom URL in localStorage (via web UI)
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem("FB_BACKEND_URL");
    if (saved && saved.trim() !== "") {
      const clean = saved.trim().replace(/\/+$/, "");
      return clean.endsWith("/api") ? clean : `${clean}/api`;
    }
  }

  // 2. Check if API_BASE_URL is set in env.js
  if (env.API_BASE_URL && env.API_BASE_URL.trim() !== "") {
    const clean = env.API_BASE_URL.trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  // 3. Check if running on localhost / file protocol
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || window.location.protocol === "file:") {
      return "http://localhost:5000/api";
    }
    // 4. Default relative /api (useful if using Vercel rewrites)
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000/api";
}

let API_BASE = resolveApiBase();

export const api = {
  isBackendConnected: false,

  /**
   * Get the current active API base URL
   */
  getBackendUrl() {
    return API_BASE;
  },

  /**
   * Update the active backend URL and persist in localStorage
   */
  setBackendUrl(url) {
    if (!url || url.trim() === "") {
      localStorage.removeItem("FB_BACKEND_URL");
    } else {
      let clean = url.trim().replace(/\/+$/, "");
      localStorage.setItem("FB_BACKEND_URL", clean);
    }
    API_BASE = resolveApiBase();
  },

  /**
   * Check if backend server is responsive
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: "GET" });
      if (res.ok) {
        this.isBackendConnected = true;
        const data = await res.json();
        return { connected: true, data };
      }
      this.isBackendConnected = false;
      return { connected: false };
    } catch (err) {
      this.isBackendConnected = false;
      return { connected: false, error: err.message };
    }
  },

  /**
   * Fetch all posts with optional filtering and sorting
   */
  async getPosts(filter = {}) {
    const params = new URLSearchParams();
    if (filter.tag && filter.tag !== "All") params.append("tag", filter.tag);
    if (filter.search) params.append("search", filter.search);
    if (filter.sort) params.append("sort", filter.sort);

    const url = `${API_BASE}/posts${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  },

  /**
   * Create a new post
   */
  async createPost(postData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error("Failed to create post");
    return await res.json();
  },

  /**
   * Toggle like on a post
   */
  async toggleLike(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to toggle like");
    return await res.json();
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId, commentData) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData)
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return await res.json();
  },

  /**
   * Delete a post
   */
  async deletePost(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return await res.json();
  },

  /**
   * Fetch platform statistics
   */
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to get stats");
    return await res.json();
  },

  /**
   * Fetch active users
   */
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error("Failed to get users");
    return await res.json();
  }
};
