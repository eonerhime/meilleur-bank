const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
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

    console.log("Account details:", account);

    res.json({
      // accountName:  account.firstName " " + account.lastName
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
    const { to, amount, narration } = req.body;

    // Basic validation
    if (!to || !amount) {
      return res
        .status(400)
        .json({ message: "To account and amount are required" });
    }

    // Get sender's account
    const sender = await Account.findOne({ customerId: req.user.id });
    if (!sender)
      return res.status(404).json({ message: "Your account not found" });

    // For NIBSS, we use account number as "from"
    const from = sender.accountNumber;

    const senderBal = await nibss.getBalance(from);
    console.log("Sender Balance:", senderBal);

    // Check local balance
    if (Number(sender.balance) < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const receiver = await Account.findOne({ accountNumber: to });

    const receiverBal = await nibss.getBalance(to);
    console.log("Receiver Balance:", receiverBal);

    console.log("Transfer details:", { from, to, amount });

    // Call NIBSS transfer
    // const nibssResult = await nibss.transfer({
    //   from,
    //   to,
    //   amount: Number(amount),
    // });
    const nibssResult = {
      ref: `TXN-${Date.now()}`,
      status: "success",
      message: "Transfer successful",
      narration: narration || "Transfer",
    };

    console.log("NIBSS transfer result:", JSON.stringify(nibssResult, null, 2));

    // Determine transfer type — add this line
    const type = receiver ? "intra" : "inter";

    // Deduct from local balance
    sender.balance -= amount;
    await sender.save();

    // If intra-bank, credit recipient locally too
    if (receiver) {
      receiver.balance += amount;
      await receiver.save();
    }

    // Record transaction
    const txn = await Transaction.create({
      customerId: req.user.id,
      transactionId: nibssResult.transactionId,
      type,
      from,
      to,
      amount,
      narration: narration || "Transfer",
      status: nibssResult.status.toLowerCase(),
    });

    console.log("Recorded transaction:", txn);

    res.status(201).json({
      message: "Transfer successful",
      transactionId: txn.transactionId,
      status: txn.status,
    });
  } catch (err) {
    next(err);
  }
};

// Transaction Status Check
exports.getTransactionStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Check locally first
    const local = await Transaction.findOne({
      transactionId,
      customerId: req.user.id, // data isolation
    });

    if (!local) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If pending, refresh from NIBSS
    if (local.status === "pending") {
      const nibssStatus = await nibss.getTransaction(transactionId);
      local.status = nibssStatus.status.toLowerCase();
      await local.save();
    }

    res.json({
      transactionId: local.transactionId,
      status: local.status,
      amount: local.amount,
      from: local.from,
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
