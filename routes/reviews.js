const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const reivew = require('../controllers/reviews');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post('/',isLoggedIn, validateReview, catchAsync(reivew.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reivew.deleteReview));

module.exports = router;