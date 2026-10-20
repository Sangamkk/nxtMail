
const crypto = require("crypto");
const Gmail = require("../services/gmailServices");
const GmailModel = require("../models/gmailModel");

exports.connect = (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Please sign in first" });

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

    const userId = req.session.userId;
    delete req.session.oauthState;

    const { tokens } = await Gmail.getTokens(req.query.code);
    const email = await Gmail.getProfile(tokens);
    await GmailModel.save(userId, email, tokens);

    req.session.save(err => err
      ? res.status(500).json({ message: "Session error" })
      : res.json({ message: "Gmail connected successfully", email }));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Gmail connection failed" });
  }
};

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

const handleError = (res, err) => {
  console.error("Gmail API error:", err);
  res.status(err.status || err.response?.status || 500).json({
    message: err.status ? err.message : "Gmail request failed",
    details: err.response?.data?.error?.message || err.message
  });
};

exports.inbox = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    res.json({ emails: await Gmail.getInboxMail(tokens) });
  } catch (err) {
    handleError(res, err);
  }
};

exports.trash = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    res.json({ emails: await Gmail.getTrashMail(tokens) });
  } catch (err) {
    handleError(res, err);
  }
};

exports.moveToTrash = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.trashEmail(tokens, req.params.id);
    res.json({ message: "Email moved to Trash" });
  } catch (err) {
    handleError(res, err);
  }
};

exports.restore = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.restoreEmail(tokens, req.params.id);
    res.json({ message: "Email restored" });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deletePermanently = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.deleteEmail(tokens, req.params.id);
    res.json({ message: "Email permanently deleted" });
  } catch (err) {
    handleError(res, err);
  }
};

exports.starred = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    res.json({ emails: await Gmail.getStarredMail(tokens) });
  } catch (err) {
    handleError(res, err);
  }
};

exports.star = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.starEmail(tokens, req.params.id);
    res.json({ message: "Email starred successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

exports.unstar = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.unstarEmail(tokens, req.params.id);
    res.json({ message: "Email unstarred successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

exports.sent = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    res.json({ emails: await Gmail.getSentMail(tokens) });
  } catch (err) {
    handleError(res, err);
  }
};