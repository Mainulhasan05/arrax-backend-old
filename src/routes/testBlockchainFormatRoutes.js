const router = require("express").Router();
const {
  testBlockchainFormatController,
} = require("../controllers/testBlockchainFormatController");

router.get("/", testBlockchainFormatController);

module.exports = router;
