const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
    },
    accountNumber: { type: String, required: true, unique: true },
    bankCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 15000,
    },
  },
  { timestamps: true },
);

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
