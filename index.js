let express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT || 3000;
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_DB_NAME || "Mmw100701!",
        database: process.env.RDS_PORT || "PHOTOPROJECT",
        port: process.env.RDS_PORT || 5433, 
        // ssl: { // comment this out if you are running locally
        //     require: true,
        //     rejectUnauthorized: false
        // } 
    }
});

// Middleware for serving static files and parsing request bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine for rendering ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes

// Landing Page
app.get("/", (req, res) => {
    res.render("landing");
});

// Login Page
app.get("/login", (req, res) => {
    res.render("login");
});

// POST Login Route (example of handling form submission)
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await knex('users').where({ username, password }).first();
        if (user) {
            res.redirect("/dashboard");
        } else {
            res.status(401).send("Invalid login credentials.");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("An error occurred while logging in.");
    }
});

// Photography Services Page
app.get("/services", (req, res) => {
    res.render("services");
});

// landing page
app.get("/landing", (req, res) => {
    res.render("landing");
});
// Gallery Page
app.get("/gallery", (req, res) => {
    res.render("gallery");
});
// Gallery Page
app.get("/art", (req, res) => {
    res.render("art");
});
// About Page
app.get("/about", (req, res) => {
    res.render("about");
});

// Inquire Page
app.get("/inquire", (req, res) => {
    res.render("inquire");
});

// Dashboard (for logged-in users)
app.get("/dashboard", (req, res) => {
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
