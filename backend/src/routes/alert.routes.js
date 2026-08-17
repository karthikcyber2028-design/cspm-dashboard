const router = require("express").Router();
const alert = require("../controllers/alert.controller");

router.get("/", alert.getAlerts);
router.get("/unread-count", alert.unreadCount);
router.put("/:id/read", alert.markRead);
router.put("/read-all", alert.markAllRead);

module.exports = router;
