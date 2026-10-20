const router = require("express").Router();
const Gmail = require("../controllers/gmailController");

router.get("/connect", Gmail.connect);
router.get("/callback", Gmail.callback);
router.get("/emails", Gmail.inbox);
router.get("/trash", Gmail.trash);
router.post("/emails/:id/trash", Gmail.moveToTrash);
router.post("/emails/:id/restore", Gmail.restore);
router.delete("/emails/:id", Gmail.deletePermanently);
router.get("/starred", Gmail.starred);
router.post("/emails/:id/star", Gmail.star);
router.post("/emails/:id/unstar", Gmail.unstar);
router.get("/sent", Gmail.sent);

module.exports = router;
