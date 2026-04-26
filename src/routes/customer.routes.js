const router = require("express").Router();
const { verifyKyc } = require("../controllers/customer.controller");
const authenticate = require("../middleware/authenticate");

router.post("/verify", authenticate, verifyKyc);

module.exports = router;
