const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let users = [];
let blogs = [];

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// REGISTER API
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({
            message: "Email already registered"
        });
    }

    users.push({
        name,
        email,
        password
    });

    res.status(201).json({
        message: "Registration successful!"
    });
});

// LOGIN API
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        user => user.email === email && user.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful!",
        user: {
            name: user.name,
            email: user.email
        }
    });
});

// CREATE BLOG API
app.post("/api/blogs", (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Please enter title and content"
        });
    }

    const newBlog = {
        id: Date.now(),
        title,
        content,
        author: author || "Anonymous"
    };

    blogs.push(newBlog);

    res.status(201).json({
        message: "Blog created successfully!",
        blog: newBlog
    });
});

// GET BLOGS API
app.get("/api/blogs", (req, res) => {
    res.json(blogs);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});