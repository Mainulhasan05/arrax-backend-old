const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // To load environment variables from .env file

// Get the database URL from the environment variables
const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error("DB_URL is not defined in .env file");
}

// Function to dynamically load all models from the models directory
const loadModels = () => {
  const modelsDir = path.join(__dirname, "../models");

  fs.readdirSync(modelsDir).forEach((file) => {
    if (file.endsWith(".js")) {
      require(path.join(modelsDir, file)); // Import each model file
    }
  });
};

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database connection successful");

    // Dynamically load models after successful connection
    loadModels();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit the process with failure code
  }
};

module.exports = connectDB;
