const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signup = async ({ name, email, password }) => {
    try {
        if (!name?.trim() || !email?.trim() || !password || password.length < 8)
            throw Object.assign(new Error("Valid details and an 8-character password are required"), { status: 400 });

        const normalizedEmail = email.trim().toLowerCase();
        if ((await User.findByEmail(normalizedEmail)).rows.length)
            throw Object.assign(new Error("Email already registered"), { status: 409 });

        return (await User.create(name.trim(), normalizedEmail, await bcrypt.hash(password, 10))).rows[0];
    } catch (err) {
        console.error("Signup error:", err);
        res.status(err.status || (err.code === "23505" ? 409 : 500))
            .json({ message: err.status ? err.message : err.code === "23505" ? "Email already registered" : "Server error" });
    }
};

exports.signin = async ({ email, password }) => {
  if (!email?.trim() || !password)
    throw Object.assign(new Error("Email and password are required"), { status: 400 });

  const { rows } = await User.findByEmail(email.trim().toLowerCase());

  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });

  const { id, name, email: userEmail } = rows[0];
  return { id, name, email: userEmail };
};
