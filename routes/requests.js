// routes/requests.js
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

    // Middleware to require photographer
    async function requirePhotographer(req, res, next) {
        if (!req.session || !req.session.userId) {
            return res.redirect('/login');
        }
        const photographer = await knex('photographers').where({ user_id: req.session.userId }).first();
        if (!photographer) {
            // User is not a photographer
            return res.redirect('/landing');
        }
        req.photographer = photographer; // attach photographer record to req
        next();
    }

    // GET /requests - list all sessions for this photographer
    router.get("/requests", requireLogin, requirePhotographer, async (req, res) => {
        try {
            const photographer_id = req.photographer.photographer_id;
            // Join sessions with users to get requester info
            const sessions = await knex('sessions')
                .join('users', 'sessions.user_id', 'users.user_id')
                .select(
                    'sessions.session_id', 
                    'sessions.date_requested', 
                    'sessions.notes', 
                    'users.first_name', 
                    'users.last_name', 
                    'users.email', 
                    'users.phone_number'
                )
                .where('sessions.photographer_id', photographer_id);

            res.render("requests", { sessions });
        } catch (error) {
            console.error("Error fetching sessions:", error);
            res.status(500).send("An error occurred while retrieving session requests.");
        }
    });

    // GET /requests/new - form to add a new session
    router.get("/requests/new", requireLogin, requirePhotographer, async (req, res) => {
        res.render("new-request");
    });

    // POST /requests/new - create a new session
    router.post("/requests/new", requireLogin, requirePhotographer, async (req, res) => {
        const { user_id, date_requested, notes } = req.body;
        const photographer_id = req.photographer.photographer_id;

        try {
            await knex('sessions').insert({
                user_id,
                photographer_id,
                date_requested,
                notes
            });
            res.redirect("/requests");
        } catch (error) {
            console.error("Error creating session:", error);
            res.status(500).send("An error occurred while creating the session.");
        }
    });

    // GET /requests/edit/:id - form to edit a session
    router.get("/requests/edit/:id", requireLogin, requirePhotographer, async (req, res) => {
        const { id } = req.params;
        const photographer_id = req.photographer.photographer_id;

        try {
            const session = await knex('sessions').where({ session_id: id, photographer_id }).first();
            if (!session) {
                return res.status(404).send("Session not found or not associated with you.");
            }
            res.render("edit-request", { session });
        } catch (error) {
            console.error("Error fetching session:", error);
            res.status(500).send("An error occurred while retrieving the session.");
        }
    });

    // POST /requests/edit/:id - update an existing session
    router.post("/requests/edit/:id", requireLogin, requirePhotographer, async (req, res) => {
        const { id } = req.params;
        const { date_requested, notes } = req.body;
        const photographer_id = req.photographer.photographer_id;

        try {
            await knex('sessions')
                .where({ session_id: id, photographer_id })
                .update({ date_requested, notes });
            res.redirect("/requests");
        } catch (error) {
            console.error("Error updating session:", error);
            res.status(500).send("An error occurred while updating the session.");
        }
    });

    // POST /requests/delete/:id - delete a session
    router.post("/requests/delete/:id", requireLogin, requirePhotographer, async (req, res) => {
        const { id } = req.params;
        const photographer_id = req.photographer.photographer_id;

        try {
            await knex('sessions')
                .where({ session_id: id, photographer_id })
                .del();
            res.redirect("/requests");
        } catch (error) {
            console.error("Error deleting session:", error);
            res.status(500).send("An error occurred while deleting the session.");
        }
    });

    return router;
};