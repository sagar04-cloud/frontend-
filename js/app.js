import { api } from "./api.js";

// Application State
const state = {
  currentTag: "All",
  searchTerm: "",
  sortBy: "latest",
  posts: [],
  currentUser: {
    name: "Alex Rivera",
    handle: "@alexrivera",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
};

// DOM Selectors
const elements = {
  statusPill: document.getElementById("status-pill"),
  statusText: document.getElementById("status-text"),
  postsFeed: document.getElementById("posts-feed"),
  composerForm: document.getElementById("composer-form"),
  composerTitle: document.getElementById("composer-title"),
  composerContent: document.getElementById("composer-content"),
  composerTag: document.getElementById("composer-tag"),
  searchInput: document.getElementById("search-input"),
  sortSelect: document.getElementById("sort-select"),
  filterPills: document.querySelectorAll(".filter-pill"),
  metricPosts: document.getElementById("metric-posts"),
  metricLikes: document.getElementById("metric-likes"),
  metricUptime: document.getElementById("metric-uptime"),
  contributorsList: document.getElementById("contributors-list"),
  toastContainer: document.getElementById("toast-container")
};

// Utilities
function showToast(message, type = "info") {
  if (!elements.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Health Checker
async function updateServerStatus() {
  const health = await api.checkHealth();
  const currentUrl = api.getBackendUrl();
  const isLocal = currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1");

  if (health.connected) {
    elements.statusPill.classList.remove("offline");
    elements.statusText.textContent = isLocal ? "Backend Live :5000" : "Railway Connected";
  } else {
    elements.statusPill.classList.add("offline");
    elements.statusText.textContent = "Offline (Click to set URL)";
  }
}

// Load Platform Stats
async function loadStats() {
  try {
    const res = await api.getStats();
    if (res.success && res.data) {
      if (elements.metricPosts) elements.metricPosts.textContent = res.data.totalPosts;
      if (elements.metricLikes) elements.metricLikes.textContent = res.data.totalLikes;
      if (elements.metricUptime) elements.metricUptime.textContent = res.data.status;
    }
  } catch (err) {
    console.warn("Could not load stats from backend:", err.message);
  }
}

// Load Users / Contributors
async function loadContributors() {
  if (!elements.contributorsList) return;
  try {
    const res = await api.getUsers();
    if (res.success && res.data) {
      elements.contributorsList.innerHTML = res.data
        .map(
          (u) => `
        <div class="contributor-item">
          <div class="contributor-profile">
            <img class="contributor-avatar" src="${u.avatar}" alt="${u.name}" />
            <div>
              <div class="contributor-name">${u.name}</div>
              <div class="contributor-role">${u.role}</div>
            </div>
          </div>
          <button class="btn-follow" onclick="this.textContent = this.textContent === 'Follow' ? 'Following' : 'Follow'">Follow</button>
        </div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.warn("Contributors fetch skipped:", err.message);
  }
}

// Render Feed
function renderPosts(posts) {
  if (!elements.postsFeed) return;

  if (!posts || posts.length === 0) {
    elements.postsFeed.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">No posts found</p>
        <p style="font-size: 0.9rem;">Try adjusting your search query or be the first to publish a post in this category!</p>
      </div>
    `;
    return;
  }

  elements.postsFeed.innerHTML = posts
    .map(
      (post) => `
    <article class="card post-card" data-post-id="${post.id}">
      <div class="post-header">
        <div class="author-meta">
          <img class="author-avatar" src="${post.author.avatar}" alt="${post.author.name}" />
          <div class="author-info">
            <span class="author-name">${post.author.name}</span>
            <span class="author-handle-time">${post.author.handle} · ${timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <span class="post-tag">${post.tag}</span>
      </div>

      <h3 class="post-title">${post.title}</h3>
      <p class="post-content">${post.content}</p>

      <div class="post-actions">
        <button class="action-btn like-btn ${post.likedByMe ? "liked" : ""}" data-id="${post.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="like-count">${post.likes}</span>
        </button>

        <button class="action-btn comment-toggle-btn" data-id="${post.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span>${post.comments ? post.comments.length : 0}</span>
        </button>

        <button class="action-btn share-btn" data-id="${post.id}" title="Share Link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>

        <button class="action-btn delete-btn" data-id="${post.id}" title="Delete Post" style="margin-left: auto;">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <!-- Expandable Comments Drawer -->
      <div class="comments-section" id="comments-${post.id}" style="display: none;">
        <div class="comment-list" id="comment-list-${post.id}">
          ${
            post.comments && post.comments.length > 0
              ? post.comments
                  .map(
                    (c) => `
                <div class="comment-item">
                  <img class="comment-avatar" src="${c.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}" alt="" />
                  <div class="comment-content">
                    <div class="comment-author">${c.author} · <span style="font-weight: 400; color: var(--text-muted); font-size: 0.75rem;">${timeAgo(c.createdAt)}</span></div>
                    <div class="comment-text">${c.text}</div>
                  </div>
                </div>
              `
                  )
                  .join("")
              : '<p style="font-size: 0.8rem; color: var(--text-muted);">No comments yet. Start the conversation!</p>'
          }
        </div>
        <form class="comment-form" data-id="${post.id}">
          <input type="text" class="comment-input" placeholder="Write a response..." required />
          <button type="submit" class="btn-comment-submit">Post</button>
        </form>
      </div>
    </article>
  `
    )
    .join("");

  attachPostEventListeners();
}

// Attach Event Listeners to dynamic post items
function attachPostEventListeners() {
  // Likes
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.onclick = async () => {
      const postId = btn.dataset.id;
      const countSpan = btn.querySelector(".like-count");
      try {
        const res = await api.toggleLike(postId);
        if (res.success) {
          btn.classList.toggle("liked", res.data.likedByMe);
          countSpan.textContent = res.data.likes;
          loadStats();
        }
      } catch (err) {
        showToast("Error updating like", "error");
      }
    };
  });

  // Comments Toggle
  document.querySelectorAll(".comment-toggle-btn").forEach((btn) => {
    btn.onclick = () => {
      const postId = btn.dataset.id;
      const section = document.getElementById(`comments-${postId}`);
      if (section) {
        section.style.display = section.style.display === "none" ? "flex" : "none";
      }
    };
  });

  // Comment Submission
  document.querySelectorAll(".comment-form").forEach((form) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const postId = form.dataset.id;
      const input = form.querySelector(".comment-input");
      const text = input.value.trim();
      if (!text) return;

      try {
        const res = await api.addComment(postId, {
          text,
          authorName: state.currentUser.name
        });
        if (res.success) {
          input.value = "";
          showToast("Comment published", "success");
          fetchAndDisplayPosts();
          loadStats();
        }
      } catch (err) {
        showToast("Could not post comment", "error");
      }
    };
  });

  // Share
  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.onclick = () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    };
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      const postId = btn.dataset.id;
      if (confirm("Are you sure you want to delete this post?")) {
        try {
          const res = await api.deletePost(postId);
          if (res.success) {
            showToast("Post deleted successfully", "success");
            fetchAndDisplayPosts();
            loadStats();
          }
        } catch (err) {
          showToast("Failed to delete post", "error");
        }
      }
    };
  });
}

// Fetch posts based on current filters
async function fetchAndDisplayPosts() {
  try {
    const res = await api.getPosts({
      tag: state.currentTag,
      search: state.searchTerm,
      sort: state.sortBy
    });
    if (res.success) {
      state.posts = res.data;
      renderPosts(res.data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    elements.postsFeed.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem; color: var(--status-danger);">
        <p><strong>Connection Notice:</strong> Unable to connect to backend server at http://localhost:5000</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">Ensure the backend is running with: <code>npm run dev</code> inside <code>backend/</code> folder.</p>
      </div>
    `;
  }
}

// Initialize Composer Form
function initComposer() {
  if (!elements.composerForm) return;

  elements.composerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = elements.composerTitle.value.trim();
    const content = elements.composerContent.value.trim();
    const tag = elements.composerTag.value;

    if (!title || !content) {
      showToast("Please provide both title and content", "error");
      return;
    }

    try {
      const res = await api.createPost({
        title,
        content,
        tag,
        authorName: state.currentUser.name,
        authorHandle: state.currentUser.handle
      });

      if (res.success) {
        elements.composerTitle.value = "";
        elements.composerContent.value = "";
        showToast("Post published to backend!", "success");
        fetchAndDisplayPosts();
        loadStats();
      }
    } catch (err) {
      showToast("Error creating post. Is backend active?", "error");
    }
  });
}

// Initialize Filter Pills & Search
function initFilters() {
  // Category Pills
  elements.filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      elements.filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.currentTag = pill.dataset.tag;
      fetchAndDisplayPosts();
    });
  });

  // Search Input with Debounce
  let searchTimeout;
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchTerm = e.target.value.trim();
        fetchAndDisplayPosts();
      }, 250);
    });
  }

  // Sort dropdown
  if (elements.sortSelect) {
    elements.sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      fetchAndDisplayPosts();
    });
  }
}

// Initial Boot
async function initApp() {
  if (elements.statusPill) {
    elements.statusPill.style.cursor = "pointer";
    elements.statusPill.title = "Click to configure or view backend URL";
    elements.statusPill.addEventListener("click", () => {
      const current = api.getBackendUrl();
      const input = prompt(
        "Backend API URL:\n" +
          current +
          "\n\nEnter your deployed Railway URL (e.g., https://your-app.up.railway.app):\nLeave empty to use default/localhost.",
        current.includes("localhost") ? "" : current
      );
      if (input !== null) {
        api.setBackendUrl(input);
        showToast("Backend URL updated. Reconnecting...", "info");
        updateServerStatus();
        fetchAndDisplayPosts();
        loadStats();
        loadContributors();
      }
    });
  }

  await updateServerStatus();
  initComposer();
  initFilters();
  await fetchAndDisplayPosts();
  await loadStats();
  await loadContributors();

  // Periodic health check
  setInterval(updateServerStatus, 10000);
}

document.addEventListener("DOMContentLoaded", initApp);
