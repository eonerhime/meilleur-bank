const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI_ATLAS || process.env.MONGODB_URI_LOCAL;

    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected at ${mongoURI}`);
    console.log("Database:", mongoose.connection.name);
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
