const pool = require("../config/db");
const Gmail = require("../services/gmailServices");
const GmailModel = require("../models/gmailModel");

const getTokens = async req => {
    if (!req.session.userId)
        throw Object.assign(new Error("Please sign in first"), { status: 401 });

    const { rows } = await GmailModel.findByUserId(req.session.userId);

    if (!rows.length)
        throw Object.assign(new Error("Connect Gmail first"), { status: 404 });

    return {
        access_token: rows[0].access_token,
        refresh_token: rows[0].refresh_token
    };
};

exports.snooze = async (req, res) => {
  try {
    const { id } = req.params;
    const { snoozedUntil, from, subject, snippet } = req.body;
    const userId = req.session.userId;

    if (!userId)
      return res.status(401).json({ message: "Please sign in first" });

    if (!snoozedUntil || !Number.isFinite(Date.parse(snoozedUntil)) ||
        Date.parse(snoozedUntil) <= Date.now()) {
      return res.status(400).json({ message: "Snooze time must be in the future" });
    }

    const tokens = await getTokens(req);
    await Gmail.snoozeEmail(tokens, id);

    await pool.query(
      `INSERT INTO snoozed_emails
       (account_id, gmail_message_id, "from", subject, snippet, snooze_until)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (account_id, gmail_message_id)
       DO UPDATE SET
         "from" = EXCLUDED."from",
         subject = EXCLUDED.subject,
         snippet = EXCLUDED.snippet,
         snooze_until = EXCLUDED.snooze_until`,
      [String(userId), id, from, subject, snippet, new Date(snoozedUntil)]
    );

    res.json({ message: "Email snoozed successfully" });
  } catch (err) {
    console.error("Snooze error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Unable to snooze email"
    });
  }
};

exports.getSnoozed = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId)
      return res.status(401).json({ message: "Please sign in first" });

    const { rows } = await pool.query(
      `SELECT
         gmail_message_id AS id,
         "from",
         subject,
         snippet,
         snooze_until
       FROM snoozed_emails
       WHERE account_id = $1
       ORDER BY snooze_until ASC`,
      [String(userId)]
    );

    res.json({ emails: rows });
  } catch (err) {
    console.error("Get snoozed error:", err);
    res.status(500).json({ message: "Unable to get snoozed emails" });
  }
};

exports.unsnooze = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { id } = req.params;

        if (!userId)
            return res.status(401).json({ message: "Please sign in first" });

        const { rows } = await pool.query(
            `SELECT gmail_message_id
       FROM snoozed_emails
       WHERE account_id = $1 AND gmail_message_id = $2`,
            [String(userId), id]
        );

        if (!rows.length)
            return res.status(404).json({ message: "Snoozed email not found" });

        const tokens = await getTokens(req);
        await Gmail.unsnoozeEmail(tokens, id);

        await pool.query(
            `DELETE FROM snoozed_emails
       WHERE account_id = $1 AND gmail_message_id = $2`,
            [String(userId), id]
        );

        res.json({ message: "Email restored to inbox" });
    } catch (err) {
        console.error("Unsnooze error:", err);
        res.status(err.status || 500).json({
            message: err.message || "Unable to restore email"
        });
    }
};
