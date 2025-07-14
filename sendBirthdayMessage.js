require("dotenv").config();
const mongoose = require("mongoose");
const { sendBirthdayMessage } = require("./utils/message"); // adjust the path
const User = require("./models/userModel");

const MONGO_URL = process.env.MONGO_URI;

const run = async () => {
  await mongoose.connect(MONGO_URL);
  const users = await User.find({}, "_id");
  for (const user of users) {
    await sendBirthdayMessage(user._id);
  }
  console.log(`[${new Date().toISOString()}] Birthday messages sent for ${users.length} users`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Cron job error:", err);
  process.exit(1);
});
