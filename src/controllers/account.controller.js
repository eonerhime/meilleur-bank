const Account = require("../models/Account");
const Customer = require("../models/Customer");
const nibss = require("../services/nibss.service");

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

    // Call NIBSS to create account
    const nibssResponse = await nibss.createAccount({
      kycType: customer.kycType,
      kycID: customer.kycId,
      dob: customer.dob,
    });

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

exports.getMyAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ customerId: req.user.id });
    if (!account) return res.status(404).json({ message: "No account found" });
    res.json({ account });
  } catch (err) {
    next(err);
  }
};
