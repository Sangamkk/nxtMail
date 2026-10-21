
const router = require("express").Router();
const AIController = require("../controllers/aiController");

router.post("/reply", AIController.draftReply);
router.post("/summary", AIController.summarizeEmail);

module.exports = router;
