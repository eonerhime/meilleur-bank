const Customer = require("../models/customer.model");

module.exports = async (req, res, next) => {
  const customer = await Customer.findById(req.user.id);
  if (!customer || !customer.isVerified) {
    return res
      .status(403)
      .json({ message: "KYC verification required before creating account" });
  }
  next();
};
