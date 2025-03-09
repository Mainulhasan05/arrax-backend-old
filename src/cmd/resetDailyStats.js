require("dotenv").config();
const cron = require("node-cron");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const User = require("../models/User"); // Adjust path as needed

// Function to reset daily fields
const resetDailyStats = async () => {
  try {
    console.log(`Running daily reset at ${moment().tz("Asia/Dhaka").format()}`);

    const result = await User.updateMany(
      {},
      {
        $set: {
          dailyTeam: 0,
          dailyPartners: 0,
          dailyActivePartners: 0,
          dailyTotalIncome: 0,
          dailyLevelIncome: 0,
          dailyDirectIncome: 0,
        },
      }
    );

    console.log(
      `Daily reset completed. Updated ${result.modifiedCount} users.`
    );
  } catch (error) {
    console.error("Error in daily reset:", error);
  }
};

// Function to schedule the cron job
const scheduleDailyReset = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      await resetDailyStats();
    },
    {
      scheduled: true,
      timezone: "Asia/Dhaka",
    }
  );
  console.log("Scheduler initialized: Runs at 12:00 AM BDT daily.");
};

module.exports = { resetDailyStats, scheduleDailyReset };
