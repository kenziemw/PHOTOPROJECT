const express = require('express');
const router = express.Router();

module.exports = (knex) => {

    // GET Register Page
    router.get("/register", (req, res) => {
        res.render("register");
    });

    // POST Register Route
    router.post("/register", async (req, res) => {
        const { first_name, last_name, email, phone_number, password } = req.body;
        try {
            // Check if email already exists
            const existingUser = await knex('users').where({ email }).first();
            if (existingUser) {
                return res.status(400).render("register", { error: "Email already registered." });
            }

            // Insert the new user and return their ID
            const newUserResult = await knex('users').insert({
                first_name,
                last_name,
                email,
                phone_number: phone_number || null,
                password
              }).returning('user_id');
              
              const newUserId = newUserResult[0].user_id;  // or newUserResult[0]

            // Automatically log them in
            req.session.userId = newUserId;

            // Redirect directly to inquire page after successful registration
            res.redirect("/inquire");
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).render("register", { error: "An error occurred during registration." });
        }
    });

    return router;
};