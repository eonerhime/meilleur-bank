const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load correct .env file
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_ATLAS
        : process.env.MONGODB_URI_LOCAL;

    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected at ${mongoURI}`);
    console.log("Databas:", mongoose.connection.name);
  } catch (err) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
