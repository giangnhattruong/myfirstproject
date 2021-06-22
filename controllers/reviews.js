const wrapAsync = require('../utilities/wrapAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const { body, rating } = req.body.review;
    const review = new Review({ body, rating });
    campground.reviews.push(review);
    review.campground = campground;
    review.author = req.user._id;
    await review.save();
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/campgrounds/${campground._id}`)
});

module.exports.renderEditReviewForm = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Sorry, the campground you are looking for does not exist!');
        return res.redirect('/campgrounds')
    }
    const review = await Review.findById(req.params.rev_id);
    if (!review) {
        req.flash('error', 'Sorry, the review you are trying to edit does not exist!');
        return res.redirect(`/campgrounds/${req.params.id}`)
    }
    res.render('campgrounds/editReview', { campground, review })
});

module.exports.editReview = wrapAsync(async (req, res, next) => {
    const { id, rev_id } = req.params;
    const { body, rating } = req.body.review;
    const review = await Review.findByIdAndUpdate(rev_id, { body, rating }, { runValidators: true, new: true });
    req.flash('success', 'Successfully edited a review!');
    res.redirect(`/campgrounds/${id}`)
});

module.exports.deleteReview = wrapAsync(async (req, res, next) => {
    const { id, rev_id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: rev_id } });
    const review = await Review.findByIdAndDelete(rev_id);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`)
});