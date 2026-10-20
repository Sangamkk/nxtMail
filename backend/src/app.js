const express = require("express");
const cors = require("cors");
const app = express();
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);

app.use(session({
  store: new PgSession({ conString: process.env.DATABASE_URL }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 86400000 }
}));
app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gmail", require("./routes/gmailRoutes"));

app.get("/", (req, res) => res.json({ message: "nxtMail API running" }));

module.exports = app;