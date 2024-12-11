let express = require("express");
let app = express();
let path = require("path");
const port = 5001;
const session = require('express-session'); // Added for sessions
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_DB_NAME || "admin!",
        database: process.env.RDS_PORT || "403photowebsite",
        port: process.env.RDS_PORT || 5432,
        /* ssl: { // comment this out if you are running locally
            require: true,
            rejectUnauthorized: false
        } */
    }
});

// Middleware for serving static files and parsing request bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware configuration
app.use(session({
    secret: 'yourSecretKeyHere', // Replace with a strong secret key in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production over HTTPS
}));

// Set view engine for rendering ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Require external routes
const loginRoutes = require("./routes/login")(knex); 
const registerRoutes = require("./routes/register")(knex); 
const inquireRoutes = require("./routes/inquire")(knex); // Added for inquiry feature

// Use routes
app.use(loginRoutes);
app.use(registerRoutes);
app.use(inquireRoutes); // Use the inquiry-specific routes

// Landing Page
app.get("/", (req, res) => {
    res.render("landing");
});

// Photography Services Page
app.get("/services", (req, res) => {
    res.render("services");
});

// Landing page
app.get("/landing", (req, res) => {
    res.render("landing");
});

// Gallery Page
app.get("/gallery", (req, res) => {
    res.render("gallery");
});

// Art Page
app.get("/art", (req, res) => {
    res.render("art");
});

// About Page
app.get("/about", (req, res) => {
    res.render("about");
});

// Middleware to require login
function requireLogin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

// Inquire Page (only accessible if logged in)
// Commenting this out since the route is now in inquire.js
// app.get("/inquire", requireLogin, (req, res) => {
//     res.render("inquire");
// });

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