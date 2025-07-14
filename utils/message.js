const cron = require('node-cron');
const { Resend } = require("resend");
const User = require("../models/userModel");
require("dotenv").config();

exports.canAddMessage = async (userId) => {
  const user = await User.findOne({ _id: userId });

  if (!user) throw new Error("User not found");

  const today = new Date();

  const updatedFriends = user.friends.map((friend) => {
    const birthday = new Date(friend.birthDate);
    birthday.setFullYear(today.getFullYear());

    const daysDiff = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
    const withinWeek = daysDiff <= 7 && daysDiff >= 0;

    const updatedFriend = {
      ...friend, 
      CanAddMessage: withinWeek
    };

    if (!withinWeek && updatedFriend.message !== undefined) {
      delete updatedFriend.message;
    }

    return updatedFriend;
  });

  user.friends = updatedFriends;
  await user.save();
};

exports.sendBirthdayMessage = async (userId) => {
  const user = await User.findOne({ _id: userId }, { password: 0 });

  if (!user) throw new Error("User not found");

  const today = new Date();
  const todayDate = today.toDateString(); // normalize comparison

  for (const friend of user.friends) {
    const birthday = new Date(friend.birthDate);
    birthday.setFullYear(today.getFullYear());

    if (birthday.toDateString() === todayDate && friend.message) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Birthday Message</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f7fafc;
                padding: 20px;
                color: #2d3748;
              }
              .container {
                background-color: #fff;
                border-radius: 8px;
                padding: 24px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                max-width: 480px;
                margin: 0 auto;
                text-align: center;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 16px;
                background-color: #48bb78;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Hey ${friend.name}! 🎉</h2>
              <p>You’ve got a special birthday message waiting just for you.</p>
              <a class="btn" href="${process.env.BIRTHDAY_APP}/message?friendId=${friend._id}&userId=${userId}">Read it now</a>
            </div>
          </body>
        </html>
      `;

      const { error } = await resend.emails.send({
        from: "Birthday Buddy <onboarding@resend.dev>",
        to: [friend.email],
        subject: `You've Got A Birthday Message`,
        html,
      });

      if (error) {
        console.error(`❌ Failed to send to ${friend.email}:`, error);
      } else {
        console.log(`✅ Birthday message sent to ${friend.email}`);
      }
    }
  }
};

// ✅ Schedule canAddMessage every day at 12:00 AM
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.find({}, '_id');
    for (const user of users) {
      await exports.canAddMessage(user._id);
    }
    console.log(`[${new Date().toISOString()}] ✅ canAddMessage run for ${users.length} users`);
  } catch (err) {
    console.error('❌ Error running canAddMessage:', err);
  }
});

// ✅ Schedule sendBirthdayMessage every day at 12:05 AM
cron.schedule('5 0 * * *', async () => {
  try {
    const users = await User.find({}, '_id');
    for (const user of users) {
      await exports.sendBirthdayMessage(user._id);
    }
    console.log(`[${new Date().toISOString()}] ✅ Birthday messages sent`);
  } catch (err) {
    console.error('❌ Error sending birthday messages:', err);
  }
});
