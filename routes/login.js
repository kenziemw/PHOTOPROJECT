const express = require('express');
const router = express.Router();

module.exports = (knex) => {

    // GET Login Page
    router.get("/login", (req, res) => {
        res.render("login");
    });

    // POST Login Route
    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await knex('users').where({ email, password }).first();
            if (user) {
                // Set session userId to logged-in user
                req.session.userId = user.user_id;
                // Redirect to inquire page after successful login
                res.redirect("/inquire");
            } else {
                res.status(401).render("login", { error: "Invalid login credentials." });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).render("login", { error: "An error occurred while logging in." });
        }
    });

    return router;
};