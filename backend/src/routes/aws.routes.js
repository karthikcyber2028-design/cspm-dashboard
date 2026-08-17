const router = require("express").Router();
const aws = require("../controllers/aws.controller");

router.get("/credentials", aws.getCredentials);
router.post("/credentials", aws.addCredential);
router.delete("/credentials/:id", aws.deleteCredential);

module.exports = router;
