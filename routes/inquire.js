const express = require('express');
const router = express.Router();

module.exports = (knex) => {

    // Middleware to require login
    function requireLogin(req, res, next) {
        if (!req.session || !req.session.userId) {
            return res.redirect('/login');
        }
        next();
    }

    // GET Inquire Page (only accessible if logged in)
    router.get("/inquire", requireLogin, async (req, res) => {
        let isPhotographer = false;
        let isLoggedIn = false;
        if (req.session && req.session.userId) {
            isLoggedIn = true;
            const photographerRecord = await knex('photographers').where({ user_id: req.session.userId }).first();
            if (photographerRecord) {
                isPhotographer = true;
            }
        }

        try {
            const photographers = await knex('photographers').select('*');
            // Pass isPhotographer and isLoggedIn to the template
            res.render("inquire", { photographers, isPhotographer, isLoggedIn });
        } catch (error) {
            console.error("Error loading photographers:", error);
            res.status(500).send("An error occurred loading the inquiry form.");
        }
    });

    // POST Submit Inquiry
    router.post("/submit-inquiry", requireLogin, async (req, res) => {
        const { photographer_id, date_requested, notes } = req.body;
        const user_id = req.session.userId; // Logged in user's ID

        try {
            // Insert a new session
            const [newSession] = await knex('sessions').insert({
                user_id,
                photographer_id,
                date_requested,
                notes
            }).returning('*');

            // Fetch photographer name for summary
            const photographer = await knex('photographers')
                .where({ photographer_id: newSession.photographer_id })
                .first();

            res.redirect(`/thank-you?photographerName=${encodeURIComponent(photographer.name)}&dateRequested=${encodeURIComponent(date_requested)}&notes=${encodeURIComponent(notes)}`);
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            res.status(500).send("An error occurred while submitting your inquiry.");
        }
    });

    // GET Thank You Page
    router.get("/thank-you", (req, res) => {
        const { photographerName, dateRequested, notes } = req.query;
        // If you need isPhotographer/isLoggedIn here as well, you must define them too.
        res.render("thank-you", { photographerName, dateRequested, notes });
    });

    return router;
};