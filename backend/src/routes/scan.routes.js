const router = require("express").Router();
const scan = require("../controllers/scan.controller");

router.post("/run", scan.runScan);
router.get("/", scan.getScans);
router.get("/:id", scan.getScanById);
router.get("/:id/findings", scan.getScanFindings);

module.exports = router;
