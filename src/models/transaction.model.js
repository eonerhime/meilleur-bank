const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    transactionId: { type: String }, // returned by NIBSS
    type: {
      type: String,
      enum: ["intra", "inter", "credit"],
    },
    fromAccount: {
      type: String,
    },
    toAccount: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    narration: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
