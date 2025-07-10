const express = require('express');
const client = require('../controllers/clientController')

const router = express.Router();

router.get('/dashboard', client.dashboard)
router.get('/deleteFriend', client.deleteFriend)

router.post('/addBirthday', client.addYourBirthday)
router.post('/addFriend', client.addFriend)
router.post('/addMessage', client.addAMessage)


module.exports = router 