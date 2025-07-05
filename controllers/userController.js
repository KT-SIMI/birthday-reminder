const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.signup = catchAsync(async (req, res) => {
    const {
        firstname,
        lastname,
        email,
        password
    } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) return res.status(400).json({ status: 'error', msg: 'Invalid email '})

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PWD_HASH_LENGTH))

    const user = new User({
        firstname,
        lastname,
        email,
        password: hashedPassword
    })

    await user.save()

    const q = await User.findOne({ _id: user._id }, { password: 0 })

    res.status(200).json({ status: 'success', msg: 'Signed up successfully', data: q })
})

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) return res.status(400).json({ status: 'error', msg: 'Please provide your email and password' })

    const user = await User.findOne({ email })

    if (!user) return res.status(404).json({ status: 'error', msg: 'Invalid email or password' })

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return res.status(401).json({ status: 'error', msg: 'Invalid email or password' })

    const payload = {
        userId: user._id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
    req.session.token = token;

    const q = await User.findOne({ _id: user._id }, { password: 0 })

    res.status(200).json({ status: 'success', msg: 'Logged in successfully', data: q })
})

exports.profile = catchAsync (async (req, res) => {
    const userId = req.user.userId

    const user = await User.findOne({ _id: userId }, { password: 0 })

    res.status(200).json({ status: 'success', msg: "User profile gotten successfully", data: user })
})

exports.getLogout = catchAsync(async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("connect.sid"); // or your session cookie name
        res.json({ status: "success", msg: "Logged out" });
    });
})