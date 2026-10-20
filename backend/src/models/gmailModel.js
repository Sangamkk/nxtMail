const db = require("../config/db");

exports.save = (userId, email, tokens) => db.query(
  `INSERT INTO gmail_accounts(user_id, email, access_token, refresh_token)
   VALUES($1, $2, $3, $4)
   ON CONFLICT(user_id, email) DO UPDATE SET
   access_token = $3,
   refresh_token = COALESCE($4, gmail_accounts.refresh_token)`,
  [userId, email, tokens.access_token, tokens.refresh_token]
);

exports.findByUserId = userId => db.query(
  "SELECT * FROM gmail_accounts WHERE user_id = $1",
  [userId]
);
