const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const { v4: uuidv4 } = require('uuid');
const { canAddMessage } = require("../utils/message");
const jwt = require("jsonwebtoken")

exports.dashboard = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const user = await User.findOne({ _id: userId }, { password: 0 })

  res.status(200).json({ status: 'success', msg: "Dashboard fetched successfully", data: user })
})

exports.addYourBirthday = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const { DOB } = req.body

  if (!DOB) return res.status(400).json({ status: 'error', msg: 'Please provide your date of birth' })

  await User.updateOne({ _id: userId }, { DOB })

  res.status(200).json({ status: 'success', msg: 'Your birthday has been added successfully' })
})

exports.addFriend = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const {
    name,
    email,
    birthDate
  } = req.body

  if (!name || !email || !birthDate) {
    return res.status(400).json({ status: 'error', msg: 'Please provide all required fields' })
  }

  const friend = {
    id: uuidv4().replace(/-/g, '').substring(0, 16),
    name,
    email,
    birthDate: new Date(birthDate),
    CanAddMessage: false
  }
  await User.updateOne({ _id: userId }, { $push: { friends: friend } })

  await canAddMessage(userId)

  res.status(200).json({ status: 'success', msg: 'Friend added successfully', data: friend })
})

exports.editFriend = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const friendId = req.query.friendId

  const {
    name,
    email,
    birthDate
  } = req.body

  const user = await User.findOne({ _id: userId }, { password: 0 })

  if (!user) return res.status(404).json({ status: 'error', msg: 'User not found' });

  const friendIndex = user.friends.findIndex((f) => f.id === friendId);
  if (friendIndex === -1) {
    return res.status(404).json({ status: 'error', msg: 'Friend not found' });
  }

  const friend = user.friends[friendIndex]

  user.friends[friendIndex] = {
    id: friend.id,
    name: name || friend.name,
    email: email || friend.email,
    birthDate: birthDate ? new Date(birthDate) : friend.birthDate,
    CanAddMessage: friend.CanAddMessage,
    message: friend.message || undefined
  }

  user.markModified('friends');
  await user.save();

   await canAddMessage(userId)

  res.status(200).json({ status: 'success', msg: 'Friend edited successfully', data: friend  })
})

exports.deleteFriend = catchAsync(async (req, res) => {
  const userId = req.user.userId
  const friendId = req.query.friendId

  await User.updateOne({ _id: userId }, { $pull: { friends: { id: friendId } } })

  res.status(200).json({ status: 'success', msg: 'Deleted Friend Successfully' })
})

exports.addAMessage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const friendId = req.query.friendId;
  const message = req.body.message;

  const user = await User.findOne({ _id: userId }, { password: 0 });
  if (!user) return res.status(404).json({ status: 'error', msg: 'User not found' });

  const friendIndex = user.friends.findIndex((f) => f.id === friendId);
  if (friendIndex === -1) {
    return res.status(404).json({ status: 'error', msg: 'Friend not found' });
  }

  const friend = user.friends[friendIndex];

  if (!friend.CanAddMessage) {
    return res.status(400).json({
      status: 'error',
      msg: "You can't add a message to this user right now",
    });
  }

  const payload = {
    friendId: friend.id,
    userId: userId
  }

  const token = jwt.sign(payload, process.env.MSG_SECRET, { expiresIn: '9d' })

  const link = `${process.env.BIRTHDAY_APP}/message?token=${token}`


  // Update message
  user.friends[friendIndex].message = message;
  user.friends[friendIndex].msgLink = link;
  user.markModified('friends');
  await user.save();

  res.status(200).json({
    status: 'success',
    msg: 'Message added successfully',
    data: user.friends[friendIndex]
  });
});
