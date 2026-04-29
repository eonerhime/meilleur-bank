const Customer = require("../models/customer.model");
const nibss = require("../services/nibss.service");

/*
POST http://localhost:3044/api/customers/verify
Pass in customer token in Authorization header to verify KYC:
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjEwMThiMzc2M2EwOWQ5Yjk0NmUzNCIsImVtYWlsIjoibWF0dGhldy5mYWRleWlAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzQwMjI3OSwiZXhwIjoxNzc3NDg4Njc5fQ.ekAK3ArFtx8XM3sJtaJBUNGVlzi-rGo0HWZQn9NT1MU
{
  "message": "KYC verification successful",
  "customer": {
    "name": "Matthew Fadeyi",
    "isVerified": true
  }
}

---
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjBkZmQzNTg3ZjJhNjM3ODRjN2QzMSIsImVtYWlsIjoib21hbGljaGFAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzM5MzY1MiwiZXhwIjoxNzc3NDgwMDUyfQ.yeOlVMOeyKa2M7ZrvDyKsTL3cfM6kxv-2DpBF2wrqyA
{
  "message": "KYC verification successful",
  "customer": {
    "name": "Omalicha Obolanosor",
    "isVerified": true
  }
}
*/
// KYC Verification — call after registration
exports.verifyKyc = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    if (customer.isVerified)
      return res.status(400).json({ message: "Already verified" });

    let nibssData;

    console.log("Customer KYC Type:", customer);
    if (customer.kycType === "bvn") {
      const result = await nibss.validateBvn(customer.kycId);
      console.log("NIBSS raw result:", JSON.stringify(result, null, 2));

      if (!result.success)
        return res.status(400).json({ message: "BVN not found in NIBSS" });
      nibssData = result.data; // data is nested under result.data
    } else {
      const result = await nibss.validateNin(customer.kycId);
      console.log("NIBSS raw result 2:", JSON.stringify(result, null, 2));

      if (!result.success)
        return res.status(400).json({ message: "NIN not found in NIBSS" });
      nibssData = result.data;
    }

    // Check DoB format from NIBSS and convert to "YYYY-MM-DD"
    const nibssDob = nibssData.dob.split("T")[0]; // "1988-03-17T00:00:00.000Z" → "1988-03-17"
    const customerDob = customer.dob.split("T")[0].trim();

    // Cross-check DOB
    if (nibssDob !== customerDob) {
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
