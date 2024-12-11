const express = require('express');
const router = express.Router();
const review = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');

router.route('/register')
    .get(review.renderRegisterForm)
    .post(catchAsync(review.createNewUser));

router.route('/login')
    .get(review.renderLoginForm)
    .post(storeReturnTo,  passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), review.login );

router.get('/logout', review.logout);

module.exports = router;