const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const { v4: uuidv4 } = require('uuid');

exports.dashboard = catchAsync (async (req, res) => {
    const userId = req.user.userId
    const user = await User.findOne({ _id: userId }, { password: 0 })

    res.status(200).json({ status: 'success', msg: "Dashboard fetched successfully", data: user })
})

exports.addYourBirthday = catchAsync ( async (req, res) => {
    const userId = req.user.userId
    const { DOB } = req.body

    if (!DOB) return res.status(400).json({ status: 'error', msg: 'Please provide your date of birth' })

    await User.updateOne({ _id: userId }, { DOB })

    res.status(200).json({ status: 'success', msg: 'Your birthday has been added successfully' })
})

exports.addFriend = catchAsync (async (req, res) => {
    const userId = req.user.userId
    const {
        name,
        email,
        birthDate
    } = req.body

    if (!name || !email || !birthday) {
        return res.status(400).json({ status: 'error', msg: 'Please provide all required fields' })
    }

    const friend = {
        id: uuidv4().replace(/-/g, '').substring(0, 16),
        name, 
        email,
        birthDate,
    }

    await User.updateOne({ _id: userId }, { $push: { friends: friend } })

    res.status(200).json({ status: 'success', msg: 'Friend added successfully' })
})

exports.addAMessage = catchAsync (async (req, res) => {
    // can't access this logic if friend's birthday is not whithin 7 days
    const userId = req.user.userId
    const friendId = req.query.friendId

})