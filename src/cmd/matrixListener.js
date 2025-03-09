const { ethers } = require("ethers");
const { JsonRpcProvider } = require("ethers");
const {
  bookingContractAddress,
  matrixProABI,
} = require("../config/contractConfig.js");

const dotenv = require("dotenv");
const { insertOrderInfo } = require("../services/orderService.js");
const { insertTransaction } = require("../services/transactionService.js");
const { insertSlotInfo } = require("../services/slotService.js");

dotenv.config();

const provider = new JsonRpcProvider(process.env.APP_RPC);
const contract = new ethers.Contract(
  bookingContractAddress,
  matrixProABI,
  provider
);

const getEventLogs = async (fromBlock = 0) => {
  try {
    console.log("Fetching events from block:", fromBlock);

    const eventFilters = {
      slotPurchased: contract.filters.SlotPurchased(),
      matrixComplete: contract.filters.MatrixComplete(),
      recycled: contract.filters.Recycled(),
      rewardDistributed: contract.filters.RewardDistributed(),
      slotsInitialized: contract.filters.SlotsInitialized(),
      emergencyWithdrawn: contract.filters.EmergencyWithdrawn(),
      slotPositionUpdated: contract.filters.SlotPositionUpdated(),
    };

    const events = await Promise.all([
      contract.queryFilter(eventFilters.slotPurchased, fromBlock),
      contract.queryFilter(eventFilters.matrixComplete, fromBlock),
      contract.queryFilter(eventFilters.recycled, fromBlock),
      contract.queryFilter(eventFilters.rewardDistributed, fromBlock),
      contract.queryFilter(eventFilters.slotsInitialized, fromBlock),
      contract.queryFilter(eventFilters.emergencyWithdrawn, fromBlock),
      contract.queryFilter(eventFilters.slotPositionUpdated, fromBlock),
    ]);

    const formattedEvents = {
      slotPurchases: events[0].map((event) => ({
        user: event.args.user,
        level: event.args.level.toString(),
        price: ethers.formatEther(event.args.price),
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      matrixCompletes: events[1].map((event) => ({
        user: event.args.user,
        level: event.args.level.toString(),
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      recycled: events[2].map((event) => ({
        user: event.args.user,
        level: event.args.level.toString(),
        recycleCount: event.args.recycleCount.toString(),
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      rewardDistributed: events[3].map((event) => ({
        user: event.args.user,
        from: event.args.from,
        amount: ethers.formatEther(event.args.amount),
        level: event.args.level.toString(),
        incomeType: event.args.incomeType,
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      slotsInitialized: events[4].map((event) => ({
        user: event.args.user,
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      emergencyWithdrawn: events[5].map((event) => ({
        token: event.args.token,
        amount: ethers.formatEther(event.args.amount),
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),

      slotPositionUpdated: events[6].map((event) => ({
        user: event.args.user,
        level: event.args.level.toString(),
        position: event.args.position.toString(),
        entryTime: event.args.entryTime.toString(),
        // transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.blockTimestamp,
      })),
    };

    return {
      success: true,
      data: formattedEvents,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      error: `Failed to fetch events: ${error.message}`,
    };
  }
};

const listenToEvents = () => {
  console.log("Listening for Matrix events...");

  contract.on("SlotPurchased", async (user, level, price, event) => {
    // console.log("New Slot Purchase:", {
    //   user,
    //   level: level.toString(),
    //   price: ethers.formatEther(price),

    // });
    console.log("inserting order info");
    await insertOrderInfo({
      user,
      level,
      price,
      // transactionHash: event.transactionHash,
    });
    await insertSlotInfo({ user, level });
  });

  contract.on("MatrixComplete", (user, level, event) => {
    console.log("Matrix Complete:", {
      user,
      level: level.toString(),
    });
  });

  contract.on("Recycled", (user, level, recycleCount, event) => {
    console.log("Position Recycled:", {
      user,
      level: level.toString(),
      recycleCount: recycleCount.toString(),
      // transactionHash: event.transactionHash,
    });
  });

  contract.on(
    "RewardDistributed",
    async (user, from, amount, level, incomeType, event) => {
      // console.log("Reward Distributed:", {
      //   user,
      //   from,
      //   amount: ethers.formatEther(amount),
      //   level: level.toString(),
      //   incomeType,
      // });
      await insertTransaction({
        user,
        from,
        amount,
        level,
        incomeType,
        // transactionHash: event.transactionHash,
      });
    }
  );

  contract.on(
    "SlotPositionUpdated",
    (user, level, position, entryTime, event) => {
      // console.log("Slot Position Updated:", {
      //   user,
      //   level: level.toString(),
      //   position: position.toString(),
      //   entryTime: entryTime.toString(),
      // });
    }
  );

  contract.on("SlotsInitialized", (user, event) => {
    console.log("Slots Initialized:", {
      user,
      // transactionHash: event.transactionHash,
    });
  });

  contract.on("EmergencyWithdrawn", (token, amount, event) => {
    console.log("Emergency Withdrawal:", {
      token,
      amount: ethers.formatEther(amount),
      // transactionHash: event.transactionHash,
    });
  });
};

const getFilteredEvents = async (contract, userAddress, fromBlock = 0) => {
  try {
    const userFilter = {
      address: contract.address,
      topics: [null, ethers.zeroPadValue(userAddress, 32)],
    };

    const events = await provider.getLogs(userFilter);
    const decodedEvents = events
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return {
      success: true,
      data: decodedEvents,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch events: ${error.message}`,
    };
  }
};

module.exports = {
  getEventLogs,
  listenToEvents,
  getFilteredEvents,
};
