const User = require("../models/userModel");

exports.canAddMessage = async (userId) => {
  const user = await User.findOne({ _id: userId });

  if (!user) throw new Error("User not found");

  const today = new Date();

  const updatedFriends = user.friends.map((friend) => {
    const birthday = new Date(friend.birthDate);
    birthday.setFullYear(today.getFullYear());

    const daysDiff = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));

    const withinWeek = daysDiff <= 7 && daysDiff >= 0;

    return {
      ...friend,
      CanAddMessage: withinWeek,
    };
  });

  user.friends = updatedFriends;
  await user.save();
};

const scheduleDailyMessageCheckForAllUsers = () => {
  const runForAllUsers = async () => {
    try {
      const users = await User.find({}, '_id');
      for (const user of users) {
        await exports.canAddMessage(user._id);
      }
      console.log(`[${new Date().toISOString()}] Ran canAddMessage for ${users.length} users`);
    } catch (err) {
      console.error('Error running daily message check:', err);
    }
  };

  const now = new Date();
  const millisUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

  setTimeout(() => {
    runForAllUsers();

    setInterval(runForAllUsers, 24 * 60 * 60 * 1000);
  }, millisUntilMidnight);
};

scheduleDailyMessageCheckForAllUsers();
