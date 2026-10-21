const AIEmail = require("../services/aiEmailService");

exports.draftReply = async (req, res) => {
    try {
        const { email, tone } = req.body;

        if (!email || typeof email !== "object") {
            return res.status(400).json({ message: "Email is required" });
        }

        const reply = await AIEmail.draftReply(email, tone || "professional");
        res.json({ reply });
    } catch (err) {
        console.error("AI reply error:", err);
        res.status(500).json({ message: "Failed to generate reply" });
    }
};

exports.summarizeEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "object") {
            return res.status(400).json({ message: "Email is required" });
        }

        const summary = await AIEmail.summarizeEmail(email);
        res.json({ summary });
    } catch (err) {
        console.error("AI summary error:", err);
        res.status(500).json({ message: "Failed to summarize email" });
    }
};
