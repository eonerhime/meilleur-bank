const Account = require("../models/account.model");
const Transaction = require("../models/transaction.model");
const nibss = require("../services/nibss.service");

// Name Enquiry
exports.nameEnquiry = async (req, res, next) => {
  try {
    const { accountNo } = req.params;
    const result = await nibss.nameEnquiry(accountNo);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Account Balance
exports.getBalance = async (req, res, next) => {
  try {
    const account = await Account.findOne({ customerId: req.user.id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Fetch live balance from NIBSS
    const nibssBalance = await nibss.getBalance(account.accountNumber);

    res.json({
      accountNumber: account.accountNumber,
      localBalance: account.balance,
      nibssBalance: nibssBalance.balance,
    });
  } catch (err) {
    next(err);
  }
};

// Fund Transfer
exports.transfer = async (req, res, next) => {
  try {
    const { toAccount, amount, narration } = req.body;

    // Get sender's account
    const fromAccountDoc = await Account.findOne({ customerId: req.user.id });
    if (!fromAccountDoc)
      return res.status(404).json({ message: "Your account not found" });

    const fromAccount = fromAccountDoc.accountNumber;

    // Check local balance
    if (fromAccountDoc.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Determine transfer type (intra vs inter)
    const toAccountDoc = await Account.findOne({ accountNumber: toAccount });
    const type = toAccountDoc ? "intra" : "inter";

    // Call NIBSS transfer
    const nibssResult = await nibss.transfer({
      fromAccount,
      toAccount,
      amount,
      narration: narration || "Transfer",
    });

    // Deduct from local balance
    fromAccountDoc.balance -= amount;
    await fromAccountDoc.save();

    // If intra-bank, credit recipient locally too
    if (toAccountDoc) {
      toAccountDoc.balance += amount;
      await toAccountDoc.save();
    }

    // Record transaction
    const txn = await Transaction.create({
      customerId: req.user.id,
      transactionRef: nibssResult.ref,
      type,
      fromAccount,
      toAccount,
      amount,
      narration,
      status: "success",
    });

    res.status(201).json({
      message: "Transfer successful",
      transactionRef: txn.transactionRef,
      status: txn.status,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Accounts (for admin)
exports.getAllAccounts = async (req, res, next) => {
  try {
    const result = await nibss.getAllAccounts();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Transaction Status Check
exports.getTransactionStatus = async (req, res, next) => {
  try {
    const { transactionRef } = req.params;

    // Check locally first
    const local = await Transaction.findOne({
      transactionRef,
      customerId: req.user.id, // data isolation
    });

    if (!local) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If pending, refresh from NIBSS
    if (local.status === "pending") {
      const nibssStatus = await nibss.getTransaction(transactionRef);
      local.status = nibssStatus.status.toLowerCase();
      await local.save();
    }

    res.json({
      transactionRef: local.transactionRef,
      status: local.status,
      amount: local.amount,
      from: local.fromAccount,
      to: local.toAccount,
      type: local.type,
      date: local.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// Transaction History (own transactions only)
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ customerId: req.user.id });

    res.json({
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
