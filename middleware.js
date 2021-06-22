const { campgroundSchema, reviewSchema } = require('./joiSchema');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError');
const multer = require('multer');
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });
const uploadMany = upload.array('image', 6);

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must login first!');
        //instead of doing if - else we can return in if
        return res.redirect('/user/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission.');
        return res.redirect(`/campgrounds/${req.params.id}`);
    };
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.rev_id);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission.');
        return res.redirect(`/campgrounds/${req.params.id}`);
    };
    next();
};

module.exports.uploadImages = (req, res, next) => {
    uploadMany(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            req.flash('error', 'Uploading failed.')
            return res.redirect(`/campgrounds/`);
        } else if (err) {
            // An unknown error occurred when uploading.
            req.flash('error', 'Uploading failed.')
            return res.redirect(`/campgrounds/`);
        }
        next();
    })
};