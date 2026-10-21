const router = require("express").Router();
const Gmail = require("../controllers/gmailController");

//Basic
router.get("/connect", Gmail.connect);
router.get("/callback", Gmail.callback);
router.get("/emails", Gmail.inbox);

//Trash
router.get("/trash", Gmail.trash);
router.post("/emails/:id/trash", Gmail.moveToTrash);
router.post("/emails/:id/restore", Gmail.restore);
router.delete("/emails/:id", Gmail.deletePermanently);

//Star
router.get("/starred", Gmail.starred);
router.post("/emails/:id/star", Gmail.star);
router.post("/emails/:id/unstar", Gmail.unstar);

//Sent
router.get("/sent", Gmail.sent);
router.post("/send", Gmail.send);

//Draft
router.post("/drafts", Gmail.createDraft);
router.get("/drafts", Gmail.getDrafts);
router.delete("/drafts/:id", Gmail.deleteDraft);

//Important
router.get("/important", Gmail.important);

//AllMail
router.get("/all", Gmail.allMail);

//Archive
router.patch("/archive/:id", Gmail.archive);

module.exports = router;
