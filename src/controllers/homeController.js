const { getHomeStats, clearCache } = require("../services/homeService");
const sendResponse = require("../utils/sendResponse");

const getHomeStatsController = async (req, res) => {
  try {
    const params = req.query;
    const stats = await getHomeStats(params);
    return sendResponse(res, 200, true, "Home stats found.", stats);
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

const clearCacheController = async (req, res) => {
  try {
    await clearCache();
    return sendResponse(res, 200, true, "Cache cleared.", null);
  } catch (error) {
    return sendResponse(res, 500, false, error.message, null);
  }
};

module.exports = {
  getHomeStatsController,
  clearCacheController,
};
