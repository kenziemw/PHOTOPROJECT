let express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT || 5001;
const session = require('express-session');
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_DB_NAME || "admin!",
        database: process.env.RDS_PORT || "403photowebsite",
        port: process.env.RDS_PORT || 5432,
        ssl: {
            require: true,
            rejectUnauthorized: false
        } 
    }
});

// Middleware for serving static files and parsing request bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware configuration
app.use(session({
    secret: 'yourSecretKeyHere', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Set view engine for rendering ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Require external routes
const loginRoutes = require("./routes/login")(knex); 
const registerRoutes = require("./routes/register")(knex); 
const inquireRoutes = require("./routes/inquire")(knex); 
const requestsRoutes = require("./routes/requests")(knex); // New requests route

// Use routes
app.use(loginRoutes);
app.use(registerRoutes);
app.use(inquireRoutes);
app.use(requestsRoutes);

// Landing Page
app.get("/", async (req, res) => {
    let isPhotographer = false;
    let isLoggedIn = false;
    if (req.session && req.session.userId) {
        isLoggedIn = true;
        const photographerRecord = await knex('photographers').where({ user_id: req.session.userId }).first();
        if (photographerRecord) {
            isPhotographer = true;
        }
    }
    res.render("landing", { isPhotographer, isLoggedIn });
});

// Photography Services Page
app.get("/services", (req, res) => {
    res.render("services");
});

// Landing page
app.get("/landing", async (req, res) => {
    let isPhotographer = false;
    let isLoggedIn = false;
    if (req.session && req.session.userId) {
        isLoggedIn = true;
        const photographerRecord = await knex('photographers').where({ user_id: req.session.userId }).first();
        if (photographerRecord) {
            isPhotographer = true;
        }
    }
    res.render("landing", { isPhotographer, isLoggedIn });
});

// Logout Route
app.get("/logout", (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        // Redirect back to landing page
        res.redirect("/landing");
    });
});

// Gallery Page
app.get("/gallery", (req, res) => {
    res.render("gallery");
});

// Art Page
app.get("/art", async (req, res) => {
    let isPhotographer = false;
    let isLoggedIn = false;
    if (req.session && req.session.userId) {
        isLoggedIn = true;
        const photographerRecord = await knex('photographers').where({ user_id: req.session.userId }).first();
        if (photographerRecord) {
            isPhotographer = true;
        }
    }
    res.render("art", { isPhotographer, isLoggedIn });
});

// About Page
app.get("/about", async (req, res) => {
    let isPhotographer = false;
    let isLoggedIn = false;
    if (req.session && req.session.userId) {
        isLoggedIn = true;
        const photographerRecord = await knex('photographers').where({ user_id: req.session.userId }).first();
        if (photographerRecord) {
            isPhotographer = true;
        }
    }
    res.render("about", { isPhotographer, isLoggedIn });
});

function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

// We have moved the inquire routes to inquire.js, so no need to define here again.

// Dashboard (for logged-in users)
app.get("/dashboard", requireLogin, (req, res) => {
    res.render("dashboard");
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>');
});

// Server listening on port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});