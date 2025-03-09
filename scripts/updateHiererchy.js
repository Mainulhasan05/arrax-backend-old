const mongoose = require("mongoose");
const User = require("../models/User");

const updateUserHierarchy = async () => {
  try {
    console.log("Fetching all users...");
    const users = await User.find({}, { userId: 1, referredBy: 1 });

    // Create a lookup map for quick access
    const userMap = new Map();
    users.forEach((user) =>
      userMap.set(user.userId, { ...user.toObject(), directReferrals: [] })
    );

    // Build relationships (populate directReferrals for each user)
    users.forEach((user) => {
      if (user.referredBy && userMap.has(user.referredBy)) {
        userMap.get(user.referredBy).directReferrals.push(user.userId);
      }
    });

    // Function to count total team recursively
    const countTotalTeam = (userId) => {
      const user = userMap.get(userId);
      if (!user) return 0;

      let totalTeam = user.directReferrals.length;
      for (const referralId of user.directReferrals) {
        totalTeam += countTotalTeam(referralId);
      }
      return totalTeam;
    };

    // Update each user with totalPartners and totalTeam
    for (const [userId, user] of userMap) {
      const totalPartners = user.directReferrals.length;
      const totalTeam = countTotalTeam(userId);

      await User.updateOne({ userId }, { totalPartners, totalTeam });
      console.log(
        `Updated user ${userId}: totalPartners=${totalPartners}, totalTeam=${totalTeam}`
      );
    }

    console.log("Hierarchy update complete.");
  } catch (error) {
    console.error("Error updating user hierarchy:", error.message);
  }
};

updateUserHierarchy();
