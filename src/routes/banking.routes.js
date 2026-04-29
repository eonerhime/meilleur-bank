const router = require("express").Router();
const {
  nameEnquiry,
  getBalance,
  transfer,
  getAllAccounts,
  getTransactionHistory,
  getTransactionStatus,
} = require("../controllers/banking.controller");
const authenticate = require("../middleware/authenticate");

router.get("/name-enquiry/:accountNo", authenticate, nameEnquiry);
router.get("/balance", authenticate, getBalance);
router.post("/transfer", authenticate, transfer);
router.get("/transactions", authenticate, getTransactionHistory);
router.get("/transaction/:transactionId", authenticate, getTransactionStatus);
router.get("/accounts", authenticate, getAllAccounts);

module.exports = router;
