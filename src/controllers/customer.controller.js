const Customer = require("../models/Customer");
const nibss = require("../services/nibss.service");

// KYC Verification — call after registration
exports.verifyKyc = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    if (customer.isVerified)
      return res.status(400).json({ message: "Already verified" });

    let nibssData;

    if (customer.kycType === "bvn") {
      const result = await nibss.validateBvn(customer.kycId);
      if (!result.valid)
        return res.status(400).json({ message: "BVN not found in NIBSS" });
      nibssData = result;
    } else {
      const result = await nibss.validateNin(customer.kycId);
      if (!result.valid)
        return res.status(400).json({ message: "NIN not found in NIBSS" });
      nibssData = result;
    }

    // Cross-check DOB
    if (nibssData.dob !== customer.dob) {
      return res
        .status(400)
        .json({ message: "Date of birth does not match identity records" });
    }

    customer.isVerified = true;
    await customer.save();

    res.json({
      message: "KYC verification successful",
      customer: {
        name: `${customer.firstName} ${customer.lastName}`,
        isVerified: customer.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
