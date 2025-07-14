const express = require('express');
const user = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get("/profile", auth, user.profile)
router.get('/logout', auth, user.getLogout)
router.get("/getMessage", user.getMessage)

router.post('/signup', user.signup)
router.post('/login', user.login)

module.exports = router 