const express = require('express');
const client = require('../controllers/clientController')

const router = express.Router();

router.get('/dashboard', client.dashboard)

router.post('/addBirthday', client.addYourBirthday)

module.exports = router 