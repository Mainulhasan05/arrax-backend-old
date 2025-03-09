const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User"); // Replace with the correct path to your User model

// Function to check and update fields
const checkAndAddFields = async () => {
  try {
    // Connect to the database
    await connectDB();

    console.log("Checking and updating fields in the User model...");

    // Define the default values for the fields
    const defaultValues = {
      image: null,
      referredBy: null,
      isOwner: false,
      directReferrals: [],
      totalTeam: 0,
      activeTeam: 0,
      dailyIncome: 0,
      dailyJoining: 0,
      income: {
        total: 0,
        levelIncome: 0,
        directIncome: 0,
        slotIncome: 0,
      },
      slots: [],
    };

    // Find all users and update missing fields
    const result = await User.updateMany(
      {}, // Match all documents
      { $setOnInsert: defaultValues }, // Set missing fields
      { upsert: false, multi: true } // Update multiple documents without creating new ones
    );

    console.log(`Processed ${result.Modified} documents.`);
    console.log(result);
  } catch (error) {
    console.error("Error while checking and updating fields:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Run the function
checkAndAddFields();
