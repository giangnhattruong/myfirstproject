const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(users.register)

router.route('/login')
    .get(users.renderLoginForm)
    .post(users.authenticate, users.login)

router.get('/logout', users.logout)

module.exports = router;
