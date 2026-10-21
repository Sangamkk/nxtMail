const crypto = require("crypto");
const Gmail = require("../services/gmailServices");
const GmailModel = require("../models/gmailModel");
const ImportantService = require("../services/importantService");


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

exports.send = async (req, res) => {
  try {
    const { to, subject, body } = req.body || {};

    if (!to?.trim() || !subject?.trim() || !body?.trim()) {
      return res.status(400).json({
        message: "To, subject, and body are required"
      });
    }

    if (/[\r\n]/.test(to) || /[\r\n]/.test(subject)) {
      return res.status(400).json({
        message: "Invalid recipient or subject"
      });
    }

    const tokens = await getTokens(req);
    const result = await Gmail.sendEmail(tokens, {
      to: to.trim(),
      subject: subject.trim(),
      body
    });

    res.status(200).json({
      message: "Email sent successfully",
      ...result
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createDraft = async (req, res) => {
  try {
    const { to = "", subject = "", body = "" } = req.body || {};

    if (typeof to !== "string" ||
      typeof subject !== "string" ||
      typeof body !== "string") {
      return res.status(400).json({ message: "Invalid draft fields" });
    }

    if (/[\r\n]/.test(to) || /[\r\n]/.test(subject)) {
      return res.status(400).json({ message: "Invalid recipient or subject" });
    }

    const tokens = await getTokens(req);
    const draft = await Gmail.createDraft(tokens, { to, subject, body });

    res.status(201).json({
      message: "Draft saved successfully",
      ...draft
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    res.json({ drafts: await Gmail.getDrafts(tokens) });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.deleteDraft(tokens, req.params.id);

    res.json({ message: "Draft deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

//Important

exports.important = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    const category = String(req.query.preferences  || "").trim();

    if (category.length > 100)
      return res.status(400).json({
        message: "Category must be 100 characters or less"
      });

    const emails = await Gmail.getInboxMailForImportant(tokens);
    const important = await ImportantService.classifyEmails(
      emails,
      category
    );
    res.json({
      category: category || "general",
      count: important.length,
      emails: important
    });
  } catch (err) {
    console.error("Important emails error:", err);

    res.status(err.status || 500).json({
      message: err.message || "Failed to classify important emails",
      details: err.response?.data?.error?.message || null
    });
  }
}

//AllMail

exports.allMail = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    const emails = await Gmail.getAllMail(tokens);

    res.json({
      count: emails.length,
      emails
    });
  } catch (err) {
    console.error("All Mail error:", err);

    res.status(err.status || 500).json({
      message: "Failed to fetch All Mail"
    });
  }
};

//Archive

exports.archive = async (req, res) => {
  try {
    const tokens = await getTokens(req);
    await Gmail.archiveEmail(tokens, req.params.id);

    res.json({ message: "Email archived successfully" });
  } catch (err) {
    console.error("Archive error:", err);

    res.status(err.status || 500).json({
      message: "Failed to archive email"
    });
  }
};
