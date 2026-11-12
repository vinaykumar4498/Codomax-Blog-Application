/**
 * Codomax Blog Application - Main JavaScript
 * Handles Authentication, Dynamic Blogs, LocalStorage Persistence, and CRUD
 */

// Storage Keys
const STORAGE_BLOGS = "codomax_blogs";
const STORAGE_USERS = "codomax_users";
const STORAGE_CURRENT_USER = "codomax_currentUser";

// Initial Demo Data
const INITIAL_BLOGS = [
    {
        id: "1",
        title: "My First Blog",
        category: "General",
        content: "Welcome to my first blog! I am learning web development with HTML, CSS, and JavaScript. It's exciting to see everything coming together into a working project. Building applications step by step is the best way to master frontend and backend concepts.",
        author: "Admin User",
        authorEmail: "admin@myblog.com",
        date: "2026-10-28",
        likes: 5
    },
    {
        id: "2",
        title: "Learning HTML and CSS",
        category: "Web Development",
        content: "HTML and CSS help us build beautiful, responsive websites. Understanding the box model, flexbox, semantic tags, and modern responsive design principles forms the bedrock of web application interfaces.",
        author: "Codomax Team",
        authorEmail: "team@codomax.com",
        date: "2026-10-30",
        likes: 12
    },
    {
        id: "3",
        title: "Why Learn JavaScript?",
        category: "Programming",
        content: "JavaScript makes websites interactive, engaging, and dynamic. From handling user clicks, storing data in LocalStorage, managing API calls, to manipulating the DOM in real-time, JavaScript brings web pages to life.",
        author: "Alex Morgan",
        authorEmail: "alex@example.com",
        date: "2026-11-01",
        likes: 8
    }
];

const INITIAL_USERS = [
    {
        id: "user-admin",
        name: "Admin User",
        email: "admin@myblog.com",
        password: "admin123"
    }
];

// --- LocalStorage Helpers ---

function getBlogs() {
    const raw = localStorage.getItem(STORAGE_BLOGS);
    if (!raw) {
        localStorage.setItem(STORAGE_BLOGS, JSON.stringify(INITIAL_BLOGS));
        return INITIAL_BLOGS;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return INITIAL_BLOGS;
    }
}

function saveBlogs(blogs) {
    localStorage.setItem(STORAGE_BLOGS, JSON.stringify(blogs));
}

function getUsers() {
    const raw = localStorage.getItem(STORAGE_USERS);
    if (!raw) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return INITIAL_USERS;
    }
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem(STORAGE_CURRENT_USER);
    } else {
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    }
}

function logout() {
    setCurrentUser(null);
    alert("You have been logged out.");
    window.location.href = "index.html";
}

// Format date nicely
function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    try {
        return new Date(dateStr).toLocaleDateString("en-US", options);
    } catch (e) {
        return dateStr;
    }
}

// Display alert messages on forms
function showAlert(containerId, message, type = "error") {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// --- Dynamic Navbar ---

function renderNavbar() {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const isHome = currentPage === "index.html" || currentPage === "";
    const isLogin = currentPage === "login.html";
    const isRegister = currentPage === "register.html";
    const isDashboard = currentPage === "dashboard.html";
    const isCreate = currentPage === "create.html";

    let html = `
        <a href="index.html" class="${isHome ? 'active' : ''}">Home</a>
    `;

    if (currentUser) {
        html += `
            <a href="dashboard.html" class="${isDashboard ? 'active' : ''}">Dashboard</a>
            <a href="create.html" class="${isCreate ? 'active' : ''}">Write a Blog</a>
            <span class="user-greeting">👋 Hi, ${currentUser.name.split(" ")[0]}</span>
            <button type="button" class="btn-logout" id="logoutBtn">Logout</button>
        `;
    } else {
        html += `
            <a href="login.html" class="${isLogin ? 'active' : ''}">Login</a>
            <a href="register.html" class="${isRegister ? 'active' : ''}">Register</a>
            <a href="dashboard.html" class="${isDashboard ? 'active' : ''}">Dashboard</a>
        `;
    }

    nav.innerHTML = html;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

// --- Home Page (index.html) ---

function initIndexPage() {
    const container = document.getElementById("blogsContainer");
    const searchInput = document.getElementById("blogSearch");
    if (!container) return;

    let blogs = getBlogs();

    function renderList(list) {
        if (!list || list.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No blogs found</h3>
                    <p>Be the first to share your story!</p>
                    <a href="create.html"><button style="margin-top: 15px;">Write a Blog</button></a>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(blog => {
            const preview = blog.content.length > 130 
                ? blog.content.substring(0, 130) + "..." 
                : blog.content;
            
            return `
                <div class="blog-card" data-id="${blog.id}">
                    <div class="blog-header-meta">
                        <span class="blog-category">${blog.category || "General"}</span>
                        <span class="blog-date">📅 ${formatDate(blog.date)}</span>
                    </div>
                    <h3 class="blog-title">${escapeHtml(blog.title)}</h3>
                    <p class="blog-author">By <strong>${escapeHtml(blog.author || "Anonymous")}</strong></p>
                    <p class="blog-preview">${escapeHtml(preview)}</p>
                    
                    <div class="blog-card-footer">
                        <button class="btn-read-more" onclick="openBlogModal('${blog.id}')">Read Full Story</button>
                        <button class="btn-like" onclick="likeBlog('${blog.id}')">❤️ <span id="like-count-${blog.id}">${blog.likes || 0}</span></button>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderList(blogs);

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = blogs.filter(b => 
                (b.title && b.title.toLowerCase().includes(query)) ||
                (b.content && b.content.toLowerCase().includes(query)) ||
                (b.author && b.author.toLowerCase().includes(query)) ||
                (b.category && b.category.toLowerCase().includes(query))
            );
            renderList(filtered);
        });
    }
}

// Like a blog
window.likeBlog = function(blogId) {
    const blogs = getBlogs();
    const blog = blogs.find(b => b.id === blogId);
    if (blog) {
        blog.likes = (blog.likes || 0) + 1;
        saveBlogs(blogs);
        const countSpan = document.getElementById(`like-count-${blogId}`);
        if (countSpan) countSpan.textContent = blog.likes;
    }
};

// Modal for reading full blog post
window.openBlogModal = function(blogId) {
    const blogs = getBlogs();
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    let modal = document.getElementById("blogReaderModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "blogReaderModal";
        modal.className = "modal-overlay";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" onclick="closeBlogModal()">&times;</button>
            <div class="modal-badge">${blog.category || "General"}</div>
            <h2 class="modal-title">${escapeHtml(blog.title)}</h2>
            <div class="modal-meta">
                <span>✍️ Written by <strong>${escapeHtml(blog.author || "Anonymous")}</strong></span>
                <span>📅 ${formatDate(blog.date)}</span>
            </div>
            <hr class="modal-divider">
            <div class="modal-body">
                ${escapeHtml(blog.content).replace(/\n/g, "<br>")}
            </div>
            <div class="modal-footer">
                <button onclick="closeBlogModal()">Close</button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
};

window.closeBlogModal = function() {
    const modal = document.getElementById("blogReaderModal");
    if (modal) {
        modal.style.display = "none";
    }
};

// Close modal when clicking outside of card
window.addEventListener("click", function(event) {
    const modal = document.getElementById("blogReaderModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// --- Register Page (register.html) ---

   function initRegisterPage() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        if (!name || !email || !password) {
            showAlert("alertContainer", "Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert("alertContainer", data.message || "Registration failed.");
                return;
            }

            showAlert(
                "alertContainer",
                "Registration successful! You can now login.",
                "success"
            );

            form.reset();

        } catch (error) {
            showAlert(
                "alertContainer",
                "Cannot connect to the backend server."
            );

            console.error(error);
        }
    });
}

// --- Login Page (login.html) ---

  // --- Login Page (login.html) ---

function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showAlert("alertContainer", "Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(
                    "alertContainer",
                    data.message || "Invalid email or password."
                );
                return;
            }

            // Save logged-in user
            setCurrentUser({
                name: data.user.name,
                email: data.user.email
            });

            showAlert(
                "alertContainer",
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            showAlert(
                "alertContainer",
                "Cannot connect to the backend server."
            );

            console.error(error);
        }
    });
}
// --- Create / Edit Blog Page (create.html) ---

function initCreatePage() {
    const blogForm = document.getElementById("blogForm");
    const blogTitle = document.getElementById("blogTitle");
    const blogCategory = document.getElementById("blogCategory");
    const blogAuthor = document.getElementById("blogAuthor");
    const blogContent = document.getElementById("blogContent");
    const submitBlogBtn = document.getElementById("submitBlogBtn");
    const alertContainer = document.getElementById("alertContainer");

    if (!blogForm) return;

    blogForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const title = blogTitle.value.trim();
        const category = blogCategory.value;
        const author = blogAuthor.value.trim() || "Anonymous";
        const content = blogContent.value.trim();

        if (!title || !content) {
            showAlert(alertContainer, "Please enter title and content.", "error");
            return;
        }

        submitBlogBtn.disabled = true;
        submitBlogBtn.textContent = "Publishing...";

        try {
            const response = await fetch("http://localhost:3000/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    category: category,
                    author: author,
                    content: content
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create blog");
            }

            // Also save locally so the Dashboard can display it
            const blogs = getBlogs();

            blogs.push({
                id: data.blog.id,
                title: data.blog.title,
                category: category,
                author: data.blog.author,
                content: data.blog.content,
                date: new Date().toISOString()
            });

            saveBlogs(blogs);

            showAlert(
                alertContainer,
                "Blog published successfully!",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Create blog error:", error);

            showAlert(
                alertContainer,
                "Could not connect to the backend server.",
                "error"
            );

            submitBlogBtn.disabled = false;
            submitBlogBtn.textContent = "Publish Blog";
        }
    });
}

// --- Dashboard Page (dashboard.html) ---
async function getBlogsFromBackend() {
    try {
        const response = await fetch("http://localhost:3000/api/blogs");

        if (!response.ok) {
            throw new Error("Failed to fetch blogs");
        }

        const blogs = await response.json();

        return blogs;

    } catch (error) {
        console.error("Backend blog error:", error);
        return [];
    }
}
 async function initDashboardPage() {
    const userBanner = document.getElementById("userBanner");
    const myBlogsContainer = document.getElementById("myBlogsContainer");
    if (!myBlogsContainer) return;

    const currentUser = getCurrentUser();
    const allBlogs = await getBlogsFromBackend();

    if (!currentUser) {
        if (userBanner) {
            userBanner.innerHTML = `
                <div class="guest-banner">
                    <p>💡 You are currently browsing as a <strong>Guest</strong>. Log in to manage your posts and track your blogs.</p>
                    <div sconst alltyle="margin-top: 10px;">
                        <a href="login.html"><button>Login</button></a>
                        <a href="register.html" style="margin-left: 10px;"><button class="btn-secondary">Register</button></a>
                    </div>
                </div>
            `;
        }

        // Show all blogs for guests
        renderDashboardBlogs(allBlogs, false);
        return;
    }

    // Filter user's blogs
    const userBlogs = allBlogs.filter(b => 
        (b.authorEmail && b.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (b.author && b.author.toLowerCase() === currentUser.name.toLowerCase())
    );

    if (userBanner) {
        userBanner.innerHTML = `
            <div class="user-profile-card">
                <div>
                    <h2>Welcome, ${escapeHtml(currentUser.name)}!</h2>
                    <p style="color: #4b5563; font-size: 15px;">📧 ${escapeHtml(currentUser.email)}</p>
                </div>
                <div class="stats-badge">
                    <span class="stats-num">${userBlogs.length}</span>
                    <span class="stats-label">Your Blogs</span>
                </div>
            </div>
        `;
    }

    renderDashboardBlogs(userBlogs, true);
}

function renderDashboardBlogs(blogsList, isOwner = true) {
    const container = document.getElementById("myBlogsContainer");
    if (!container) return;

    if (!blogsList || blogsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No blogs found</h3>
                <p>You haven't written any blogs yet.</p>
                <a href="create.html"><button style="margin-top: 15px;">Create Your First Blog</button></a>
            </div>
        `;
        return;
    }

    container.innerHTML = blogsList.map(blog => {
        const preview = blog.content.length > 150 
            ? blog.content.substring(0, 150) + "..." 
            : blog.content;

        return `
            <div class="blog-card dashboard-card" id="blog-row-${blog.id}">
                <div class="blog-header-meta">
                    <span class="blog-category">${blog.category || "General"}</span>
                    <span class="blog-date">📅 ${formatDate(blog.date)}</span>
                </div>
                <h3>${escapeHtml(blog.title)}</h3>
                <p style="color: #4b5563; margin-top: 8px;">${escapeHtml(preview)}</p>
                
                <div class="dashboard-actions">
                    <button class="btn-read-more" onclick="openBlogModal('${blog.id}')">View</button>
                    ${isOwner ? `
                        <a href="create.html?edit=${blog.id}"><button class="btn-edit">✏️ Edit</button></a>
                        <button class="btn-delete" onclick="deleteBlog('${blog.id}')">🗑️ Delete</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join("");
}

// Delete a blog post
window.deleteBlog = function(blogId) {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
        return;
    }

    let blogs = getBlogs();
    blogs = blogs.filter(b => b.id !== blogId);
    saveBlogs(blogs);

    // Re-render
    initDashboardPage();
};

// Helper to escape HTML characters
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();

    // Route based on current page
    const path = window.location.pathname;
    if (path.endsWith("index.html") || path.endsWith("/") || path === "") {
        initIndexPage();
    } else if (path.endsWith("login.html")) {
        initLoginPage();
    } else if (path.endsWith("register.html")) {
        initRegisterPage();
    } else if (path.endsWith("create.html")) {
        initCreatePage();
    } else if (path.endsWith("dashboard.html")) {
        initDashboardPage();
    }
});


