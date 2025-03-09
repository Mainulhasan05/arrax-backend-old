const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendResponse = require("../utils/sendResponse");

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return sendResponse(res, 401, false, "Unauthorized. Token not found.");
  }
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findOne({ userId: decoded.userId });
    if (!user) {
      return sendResponse(res, 404, false, "User not found.");
    }
    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, "Invalid token.");
  }
};

module.exports = verifyToken;
