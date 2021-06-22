const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground, uploadImages } = require('../middleware');

router.route('/')
    .get(campgrounds.index)
    .post(
        isLoggedIn,
        uploadImages,
        validateCampground,
        campgrounds.createNewCampground
    )

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.showCampground)
    .put(
        isLoggedIn,
        isAuthor,
        uploadImages,
        validateCampground,
        campgrounds.editCampground
    )
    .delete(
        isLoggedIn,
        isAuthor,
        campgrounds.deleteCampground
    )

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;