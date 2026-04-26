const router = require("express").Router();
const {
  createAccount,
  getMyAccount,
} = require("../controllers/account.controller");
const authenticate = require("../middleware/authenticate");
const isVerified = require("../middleware/isVerified");

router.post("/create", authenticate, isVerified, createAccount);
router.get("/me", authenticate, getMyAccount);

module.exports = router;
