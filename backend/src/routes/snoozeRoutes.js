const express = require("express");
const router = express.Router();
const Snooze = require("../controllers/snoozeController");

router.post("/:id", Snooze.snooze);
router.get("/", Snooze.getSnoozed);
router.delete("/:id", Snooze.unsnooze);

module.exports = router;