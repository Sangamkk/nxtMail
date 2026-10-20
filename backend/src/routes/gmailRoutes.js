const router = require("express").Router();
const Gmail = require("../controllers/gmailController");

router.get("/connect", Gmail.connect);
router.get("/callback", Gmail.callback);
router.get("/emails", Gmail.emails);

module.exports = router;