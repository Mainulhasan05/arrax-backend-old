require("dotenv").config();
const cron = require("node-cron");
const { ethers, JsonRpcProvider } = require("ethers");
const { 
  bookingContractAddress, 
  matrixProABI 
} = require("../config/contractConfig.js");
const { insertOrderInfo } = require("../services/orderService.js");
const { insertTransaction } = require("../services/transactionService.js");
const { insertSlotInfo } = require("../services/slotService.js");

const rpcURL = process.env.APP_RPC;
const provider = new JsonRpcProvider(rpcURL);

const getContract = () => {
  try {
    const contract = new ethers.Contract(
      bookingContractAddress,
      matrixProABI,
      provider
    );
    return contract;
  } catch (error) {
    console.log("Error initializing contract:", error);
    return null;
  }
};

const handleMissingEvents = async () => {
  try {
    const contract = getContract();
    if (!contract) throw new Error("Contract initialization failed");

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    // Calculate block range (last 100 blocks or another suitable range)
    const fromBlock = currentBlock - 10000;

    const eventFilters = {
      slotPurchased: contract.filters.SlotPurchased(),
      rewardDistributed: contract.filters.RewardDistributed(),
      slotPositionUpdated: contract.filters.SlotPositionUpdated()
    };

    // Fetch events
    const events = await Promise.all([
      contract.queryFilter(eventFilters.slotPurchased, fromBlock),
      contract.queryFilter(eventFilters.rewardDistributed, fromBlock),
      contract.queryFilter(eventFilters.slotPositionUpdated, fromBlock)
    ]);

    console.log(`Processing events from block ${fromBlock} to ${currentBlock}`);
    console.log("***********",events[0])
    // Process SlotPurchased events
    for (const event of events[0]) {
      try {
        console.log("***********",event)
        await insertOrderInfo({
            user: event.args.user,
            level: Number(event.args.level),
            price: Number(event.args.price),
          });
        await insertSlotInfo({ 
          user: event.args.user, 
          level: Number(event.args.level) 
        });


        // console.log({
        //     user: event.args.user,
        //     level: event.args.level,
        //     price: event.args.price,
        //   },{ 
        //     user: event.args.user, 
        //     level: event.args.level 
        //   } )
        console.log(`Processed SlotPurchased event at block ${event.blockNumber}`);
      } catch (error) {
        console.error(`Error processing SlotPurchased event:`, error);
      }
    }

    // Process RewardDistributed events
    for (const event of events[1]) {
      try {


        console.log({
            user: event.args.user,
            from: event.args.from,
            amount: Number(event.args.amount),
            level: Number(event.args.level),
            incomeType: event.args.incomeType,
            transactionHash: event.transactionHash
          })
        await insertTransaction({
            user: event.args.user,
            from: event.args.from,
            amount: Number(event.args.amount),
            level: Number(event.args.level),
            incomeType: event.args.incomeType,
            transactionHash: event.transactionHash
          });

        
        console.log(`Processed RewardDistributed event at block ${event.blockNumber}`);
      } catch (error) {
        console.error(`Error processing RewardDistributed event:`, error);
      }
    }

    // Process SlotPositionUpdated events if needed
    for (const event of events[2]) {
      try {
        // Add your logic for handling SlotPositionUpdated events
        console.log(`Processed SlotPositionUpdated event at block ${event.blockNumber}`);
      } catch (error) {
        console.error(`Error processing SlotPositionUpdated event:`, error);
      }
    }

    console.log('Finished processing events');
  } catch (error) {
    console.error("Error in handleMissingEvents:", error);
  }
};

const scheduleEventSync = () => {
  const cronSchedule = "0 * * * *"; // Run every hour

  try {
    if (!cron.validate(cronSchedule)) {
      throw new Error("Invalid cron schedule expression");
    }

    const job = cron.schedule(
      cronSchedule,
      async () => {
        console.log(`Starting scheduled event sync at ${new Date().toISOString()}`);
        try {
          await handleMissingEvents();
        } catch (error) {
          console.error("Scheduled event sync failed:", error);
        }
      },
      {
        scheduled: true,
        timezone: "UTC"
      }
    );

    // Run initial sync
    console.log("Running initial event sync...");
    handleMissingEvents().catch((error) => {
      console.error("Initial event sync failed:", error);
    });

    return job;
  } catch (error) {
    console.error("Failed to schedule event sync cron job:", error);
    throw error;
  }
};

module.exports = scheduleEventSync;