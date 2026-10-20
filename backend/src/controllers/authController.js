
const Auth = require("../services/authService");

exports.signup = async (req, res) => {
  try {
    const user = await Auth.signup(req.body);
    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    res.status(err.status || (err.code === "23505" ? 409 : 500))
      .json({ message: err.status ? err.message : err.code === "23505" ? "Email already registered" : "Server error" });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await Auth.signin(req.body);
    req.session.userId = user.id;
    req.session.save(err => err
      ? res.status(500).json({ message: "Session error" })
      : res.json({ message: "Signin successful", user }));
  } catch (err) {
    res.status(err.status || 500)
      .json({ message: err.status ? err.message : "Server error" });
  }
};
