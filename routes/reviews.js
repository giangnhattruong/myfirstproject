const express = require('express');
//due to absent of :id (of campground) in reviewRoutes, we need to mergeParams from app.js
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateReview, reviews.createReview);

router.get('/:rev_id/edit', isLoggedIn, isReviewAuthor, reviews.renderEditReviewForm);

router.route('/:rev_id')
    .put(isLoggedIn, isReviewAuthor, validateReview, reviews.editReview)
    .delete(isLoggedIn, isReviewAuthor, reviews.deleteReview)

module.exports = router;