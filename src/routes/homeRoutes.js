const {
  getHomeStatsController,
  clearCacheController,
} = require("../controllers/homeController");

const router = require("express").Router();

router.get("/stats", getHomeStatsController);
router.get("/clear-cache", clearCacheController);

module.exports = router;
