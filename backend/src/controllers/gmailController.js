const crypto = require("crypto");
const Gmail = require("../services/gmailServices");
const GmailModel = require("../models/gmailModel");

exports.connect = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please sign in first" });
  }

  const state = crypto.randomBytes(32).toString("hex");
  req.session.oauthState = state;

  req.session.save(err => {
    if (err) return res.status(500).json({ message: "Session error" });
    res.redirect(Gmail.getAuthUrl(state));
  });
};

exports.callback = async (req, res) => {
  try {
    if (!req.session.userId || !req.query.state ||
        req.query.state !== req.session.oauthState) {
      return res.status(403).json({ message: "Invalid OAuth state or session" });
    }

    delete req.session.oauthState;

    const { tokens } = await Gmail.getTokens(req.query.code);
    const email = await Gmail.getProfile(tokens);

    await GmailModel.save(req.session.userId, email, tokens);

    res.json({ message: "Gmail connected successfully", email });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Gmail connection failed" });
  }
};

exports.emails = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Please sign in first" });
    }

    const { rows } = await GmailModel.findByUserId(req.session.userId);
    if (!rows.length) {
      return res.status(404).json({ message: "Connect Gmail first" });
    }

    const emails = await Gmail.getEmails({
      access_token: rows[0].access_token,
      refresh_token: rows[0].refresh_token
    });

    res.json({ emails });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch emails" });
  }
};
