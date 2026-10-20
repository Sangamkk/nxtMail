const router = require("express").Router();
const Auth = require("../controllers/authController");

router.post("/signup", Auth.signup);
router.post("/signin", Auth.signin);

router.get("/me", (req, res) =>
  res.json({ userId: req.session.userId || null })
);

module.exports = router;