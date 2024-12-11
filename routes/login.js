const express = require('express');
const router = express.Router();

module.exports = (knex) => {

    // GET /login
    router.get("/login", (req, res) => {
        const redirectUrl = req.query.redirect || null;
        // Pass redirectUrl to the template so we can preserve it in the form action
        res.render("login", { error: null, redirectUrl });
    });

    // POST /login
    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        const redirectUrl = req.query.redirect || null; // Read from query, not body

        try {
            const user = await knex('users').where({ email, password }).first();
            if (user) {
                // Set the session userId
                req.session.userId = user.user_id;

                // If redirect is provided, go there; otherwise, go to /landing
                if (redirectUrl) {
                    return res.redirect(redirectUrl);
                }
                return res.redirect("/landing");
            } else {
                // Invalid credentials; re-render login with error and maintain redirect
                res.status(401).render("login", { error: "Invalid login credentials.", redirectUrl });
            }
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).render("login", { error: "An error occurred while logging in.", redirectUrl });
        }
    });

    return router;
};