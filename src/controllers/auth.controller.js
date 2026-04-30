const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/*
POST http://localhost:3044/api/auth/register
Example registration payload:
{
  "firstName": "Matthew",
  "lastName": "Fadeyi",
  "email": "matthew.fadeyi@meilleurbank.com",
  "password": "Password123",
  "kycType": "bvn",
  "kycId": "90213478564",
  "dob": "1988-03-17"
}

{
  "message": "Registration successful. Please complete KYC verification.",
  "customerId": "69f1018b3763a09d9b946e34"
  "accountNumber": "7984333050",
}

---

  {
    "bvn": "62918230948",
    "firstName": "Omalicha",
    "lastName": "Obolanosor",
    "email": "omalicha@meilleurbank.com",
    "kycType": "bvn",
    "dob": "1993-11-29",
    "phone": "09192345678",
  }

{
  "message": "Registration successful. Please complete KYC verification.",
  "customerId": "69f0dfd3587f2a63784c7d31"
  "accountNumber": "7981153422",
}

*/
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

/*
POST http://localhost:3044/api/auth/login
{
  "email": "matthew.fadeyi@meilleurbank.com",
  "password": "Password123"
}

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjEwMThiMzc2M2EwOWQ5Yjk0NmUzNCIsImVtYWlsIjoibWF0dGhldy5mYWRleWlAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzQ5MjIyNSwiZXhwIjoxNzc3NTc4NjI1fQ.weY0aEjwhIsxr58cOmpwtAm_Zp7WT4hlVg9HcnqhqJ0",
  "customer": {
    "id": "69f1018b3763a09d9b946e34",
    "name": "Matthew Fadeyi",
    "email": "matthew.fadeyi@meilleurbank.com",
    "isVerified": true
  }
}
  ---
{
    "email": "omalicha@meilleurbank.com",
    "password": "pass123*"
}

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjBkZmQzNTg3ZjJhNjM3ODRjN2QzMSIsImVtYWlsIjoib21hbGljaGFAbWVpbGxldXJiYW5rLmNvbSIsImlhdCI6MTc3NzM5MzY1MiwiZXhwIjoxNzc3NDgwMDUyfQ.yeOlVMOeyKa2M7ZrvDyKsTL3cfM6kxv-2DpBF2wrqyA",
  "customer": {
    "id": "69f0dfd3587f2a63784c7d31",
    "name": "Omalicha Obolanosor",
    "email": "omalicha@meilleurbank.com",
    "isVerified": false
  }
}
*/
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
