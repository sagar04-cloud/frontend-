/**
 * FB Application API Client
 * Manages communication with the Express backend service,
 * with graceful fallback to cached/mock data if the backend is unreachable.
 */

const API_BASE = (typeof window !== "undefined" && window.location.origin && !window.location.origin.startsWith("file://"))
  ? `${window.location.origin}/api`
  : "http://localhost:5000/api";

export const api = {
  isBackendConnected: false,

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
