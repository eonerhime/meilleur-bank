const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, kycType, kycId, dob } =
      req.body;

    const exists = await Customer.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });

    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      password,
      kycType,
      kycId,
      dob,
    });

    res.status(201).json({
      message: "Registration successful. Please complete KYC verification.",
      customerId: customer._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = await customer.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      customer: {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        isVerified: customer.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
