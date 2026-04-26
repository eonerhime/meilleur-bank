const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    kycType: {
      type: String,
      enum: ["bvn", "nin"],
      required: true,
    },
    kycId: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    }, // YYYY-MM-DD
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Hash password before saving
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
customerSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
