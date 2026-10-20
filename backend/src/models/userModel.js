const db = require("../config/db");

exports.create = (name, email, password) =>
  db.query(
    "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",
    [name, email, password]
  );

exports.findByEmail = (email) =>
  db.query("SELECT * FROM users WHERE email=$1", [email]);