const {
  testBlockchainFormatService,
} = require("../services/testBlockchainFormatService");

const testBlockchainFormatController = async (req, res) => {
  try {
    const result = await testBlockchainFormatService();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { testBlockchainFormatController };
