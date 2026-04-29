const Account = require("../models/account.model");
const Customer = require("../models/customer.model");
const nibss = require("../services/nibss.service");

/*
  POST http://localhost:3044/api/accounts/create

  token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjEwMThiMzc2M2EwOWQ5Yjk0NmUzNCIsImVtYWlsIjoibWF0dGhldy5mYWRleWlAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzQwMjI3OSwiZXhwIjoxNzc3NDg4Njc5fQ.ekAK3ArFtx8XM3sJtaJBUNGVlzi-rGo0HWZQn9NT1MU

  Response:
  {
    "message": "Account created successfully",
    "account": {
      "accountNumber": "7984333050",
      "bankCode": "798",
      "bankName": "MEI Bank",
      "balance": 15000
    }
  }
  ---

  token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjBkZmQzNTg3ZjJhNjM3ODRjN2QzMSIsImVtYWlsIjoib21hbGljaGFAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzM5MzY1MiwiZXhwIjoxNzc3NDgwMDUyfQ.yeOlVMOeyKa2M7ZrvDyKsTL3cfM6kxv-2DpBF2wrqyA

  Response:
  {
  "message": "Account created successfully",
  "account": {
    "accountNumber": "7981153422",
    "bankCode": "798",
    "balance": 15000
  }
}
*/
exports.createAccount = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.id);

    // Enforce 1 account per customer
    const existing = await Account.findOne({ customerId: customer._id });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Customer already has an account" });
    }

    /*
      POST http://localhost:3044/api/accounts/create
      Include Authorization token in header
    */
    // Call NIBSS to create account
    const nibssResponse = await nibss.createAccount({
      kycType: customer.kycType,
      kycID: customer.kycId,
      dob: customer.dob,
    });

    console.log("NIBSS Response:", nibssResponse);

    // Save locally
    const account = await Account.create({
      customerId: customer._id,
      accountNumber: nibssResponse.account.accountNumber,
      bankCode: nibssResponse.account.bankCode,
      bankName: nibssResponse.account.bankName,
      balance: 15000,
    });

    res.status(201).json({
      message: "Account created successfully",
      account: {
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        bankName: account.bankName,
        balance: account.balance,
      },
    });
  } catch (err) {
    next(err);
  }
};

/*
  GET http://localhost:3044/api/accounts/me
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjBkZmQzNTg3ZjJhNjM3ODRjN2QzMSIsImVtYWlsIjoib21hbGljaGFAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzM5MzY1MiwiZXhwIjoxNzc3NDgwMDUyfQ.yeOlVMOeyKa2M7ZrvDyKsTL3cfM6kxv-2DpBF2wrqyA

Response:

{
  "account": {
    "bankName": "MEI Bank",
    "_id": "69f0e12c7ad823e4f143c95d",
    "customerId": "69f0dfd3587f2a63784c7d31",
    "accountNumber": "7981153422",
    "bankCode": "798",
    "balance": 15000,
    "createdAt": "2026-04-28T16:32:44.181Z",
    "updatedAt": "2026-04-28T16:32:44.181Z",
    "__v": 0
  }
}
  ---

  token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjEwMThiMzc2M2EwOWQ5Yjk0NmUzNCIsImVtYWlsIjoibWF0dGhldy5mYWRleWlAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzQwMjI3OSwiZXhwIjoxNzc3NDg4Njc5fQ.ekAK3ArFtx8XM3sJtaJBUNGVlzi-rGo0HWZQn9NT1MU

  Response:
  {
  "account": {
    "_id": "69f1023e4a1b18a279b60f6c",
    "customerId": "69f1018b3763a09d9b946e34",
    "accountNumber": "7984333050",
    "bankCode": "798",
    "bankName": "MEI Bank",
    "balance": 15000,
    "createdAt": "2026-04-28T18:53:50.425Z",
    "updatedAt": "2026-04-28T18:53:50.425Z",
    "__v": 0
  }
}
*/
exports.getMyAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ customerId: req.user.id });
    if (!account) return res.status(404).json({ message: "No account found" });
    res.json({ account });
  } catch (err) {
    next(err);
  }
};
