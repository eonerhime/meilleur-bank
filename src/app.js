require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const customerRoutes = require("./routes/customer.routes");
const accountRoutes = require("./routes/account.routes");
const bankingRoutes = require("./routes/banking.routes");

const app = express();
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/banking", bankingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3044;
app.listen(PORT, () => console.log(`Meilleur Bank running on port ${PORT}`));
