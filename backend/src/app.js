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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/snooze", require("./routes/snoozeRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gmail", require("./routes/gmailRoutes"));


app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

module.exports = app;