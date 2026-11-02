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

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("regConfirmPassword") 
            ? document.getElementById("regConfirmPassword").value 
            : password;

        if (!name || !email || !password) {
            showAlert("alertContainer", "Please fill in all required fields.");
            return;
        }

        if (password.length < 6) {
            showAlert("alertContainer", "Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            showAlert("alertContainer", "Passwords do not match!");
            return;
        }

        const users = getUsers();
        const existing = users.find(u => u.email.toLowerCase() === email);
        if (existing) {
            showAlert("alertContainer", "An account with this email already exists. Please log in.");
            return;
        }

        const newUser = {
            id: "user-" + Date.now(),
            name,
            email,
            password
        };

        users.push(newUser);
        saveUsers(users);

        // Auto login the user
        setCurrentUser({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

        showAlert("alertContainer", "Account created successfully! Redirecting to dashboard...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1200);
    });
}

// --- Login Page (login.html) ---

function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showAlert("alertContainer", "Please enter both email and password.");
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

        if (!user) {
            showAlert("alertContainer", "Invalid email or password. Please try again.");
            return;
        }

        setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email
        });

        showAlert("alertContainer", "Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    });
}

// --- Create / Edit Blog Page (create.html) ---

function initCreatePage() {
    const form = document.getElementById("blogForm");
    if (!form) return;

    const titleInput = document.getElementById("blogTitle");
    const categorySelect = document.getElementById("blogCategory");
    const authorInput = document.getElementById("blogAuthor");
    const contentInput = document.getElementById("blogContent");
    const submitBtn = document.getElementById("submitBlogBtn");
    const pageHeading = document.getElementById("createPageHeading");

    const currentUser = getCurrentUser();
    if (currentUser && authorInput) {
        authorInput.value = currentUser.name;
    }

    // Check if in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    let editBlog = null;

    if (editId) {
        const blogs = getBlogs();
        editBlog = blogs.find(b => b.id === editId);

        if (editBlog) {
            if (pageHeading) pageHeading.textContent = "Edit Blog Post";
            if (titleInput) titleInput.value = editBlog.title;
            if (categorySelect) categorySelect.value = editBlog.category || "General";
            if (authorInput) authorInput.value = editBlog.author;
            if (contentInput) contentInput.value = editBlog.content;
            if (submitBtn) submitBtn.textContent = "Save Changes";
        }
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const category = categorySelect ? categorySelect.value : "General";
        const author = authorInput ? authorInput.value.trim() : (currentUser ? currentUser.name : "Anonymous");
        const content = contentInput.value.trim();

        if (!title || !content) {
            showAlert("alertContainer", "Please fill in the blog title and content.");
            return;
        }

        let blogs = getBlogs();

        if (editBlog) {
            // Update existing
            editBlog.title = title;
            editBlog.category = category;
            editBlog.author = author;
            editBlog.content = content;
            editBlog.date = new Date().toISOString().split("T")[0]; // update modified date
            saveBlogs(blogs);

            showAlert("alertContainer", "Blog updated successfully! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            // Create new
            const newBlog = {
                id: Date.now().toString(),
                title,
                category,
                content,
                author: author || "Anonymous",
                authorEmail: currentUser ? currentUser.email : "guest@myblog.com",
                date: new Date().toISOString().split("T")[0],
                likes: 0
            };

            blogs.unshift(newBlog); // Add new blog to top of the list
            saveBlogs(blogs);

            showAlert("alertContainer", "Blog published successfully! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        }
    });
}

// --- Dashboard Page (dashboard.html) ---

function initDashboardPage() {
    const userBanner = document.getElementById("userBanner");
    const myBlogsContainer = document.getElementById("myBlogsContainer");
    if (!myBlogsContainer) return;

    const currentUser = getCurrentUser();
    const allBlogs = getBlogs();

    if (!currentUser) {
        if (userBanner) {
            userBanner.innerHTML = `
                <div class="guest-banner">
                    <p>💡 You are currently browsing as a <strong>Guest</strong>. Log in to manage your posts and track your blogs.</p>
                    <div style="margin-top: 10px;">
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


document.addEventListener("DOMContentLoaded", function () {
    renderNavbar();
    initIndexPage();
    initRegisterPage();
    initLoginPage();
    initCreatePage();
    initDashboardPage();
});