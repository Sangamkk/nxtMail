
require("dotenv").config();
const db = require("./db");

db.query("SELECT NOW()")
  .then(({ rows }) => console.log("DB connected:", rows[0]))
  .catch(err => console.error("DB error:", err.message))
  .finally(() => db.end());
