const mongoose = require("mongoose");
const User = require("../models/User"); // Assuming models are imported correctly
const Order = require("../models/Order");

let cachedStats = null; // Cache for home stats
let cacheTimestamp = null; // Timestamp for cache validity
const CACHE_DURATION = 5 * 60 * 1000; // Cache duration: 5 minutes
const ETH_TO_USD_RATE = 1; // Example Ether-to-USD rate, replace with a dynamic rate if needed

// Helper function to convert price from Wei to USD
const convertPriceToUSD = (price) => {
  const etherValue =
    parseFloat(mongoose.Types.Decimal128.fromString(price).toString()) / 1e18; // Convert Wei to Ether
  return etherValue * ETH_TO_USD_RATE; // Convert Ether to USD
};

// Function to get home stats
const getHomeStats = async (params) => {
  const { refreshCache = false } = params || {};

  // Check if the cache is valid
  const isCacheValid =
    cachedStats &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION;

  if (!refreshCache && isCacheValid) {
    console.log("Returning cached stats");
    return cachedStats;
  }

  try {
    // Calculate start and end of today
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    // Fetch total and daily user count
    const totalUsers = await User.countDocuments({});
    const dailyUsers = await User.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    // Fetch total and daily income
    const allOrders = await Order.find({});
    const totalIncome = allOrders.reduce(
      (sum, order) => sum + convertPriceToUSD(order.price),
      0
    );

    const dailyOrders = await Order.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    const dailyIncome = dailyOrders.reduce(
      (sum, order) => sum + convertPriceToUSD(order.price),
      0
    );

    // Prepare stats
    const stats = {
      totalUsers,
      dailyUsers,
      totalIncome: totalIncome.toFixed(2), // Format to 2 decimal places
      dailyIncome: dailyIncome.toFixed(2), // Format to 2 decimal places
    };

    // Cache the stats
    cachedStats = stats;
    cacheTimestamp = Date.now();

    return stats;
  } catch (error) {
    console.error("Error fetching home stats:", error);
    throw new Error("Error fetching home stats");
  }
};

// Function to clear the cache
const clearCache = () => {
  cachedStats = null;
  cacheTimestamp = null;
};

module.exports = { getHomeStats, clearCache };
