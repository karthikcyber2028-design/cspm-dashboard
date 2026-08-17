const router = require("express").Router();
const dash = require("../controllers/dashboard.controller");

router.get("/overview", dash.getOverview);
router.get("/resources", dash.getResources);
router.get("/services", dash.getServices);

module.exports = router;
