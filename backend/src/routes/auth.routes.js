const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/me", require("../middleware/auth").authenticate, auth.me);

module.exports = router;
