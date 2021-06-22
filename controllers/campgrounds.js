const wrapAsync = require('../utilities/wrapAsync');
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
});

module.exports.showCampground = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    if (!campground) {
        req.flash('error', 'Sorry, the campground you are looking for does not exist!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/campground', { campground })
});

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createNewCampground = wrapAsync(async (req, res, next) => {
    const { location } = req.body.campground;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()
    const images = req.files.map(file => {
        const container = {};
        container.url = file.path;
        container.filename = file.filename;
        return container;
    });
    //short hand (file => ({url: file.path, filename: file.originalname}))
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    campground.images = images;
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
});

module.exports.renderEditForm = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Sorry, we can not find this campground!');
        return res.redirect('/campgrounds');
    };
    res.render('campgrounds/edit', { campground })
});

module.exports.editCampground = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, location, price, description } = req.body.campground;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send()
    const campground = await Campground.findById(id);
    const images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.images.push(...images);
    await Campground.findByIdAndUpdate(id, { 
        title, 
        location, 
        price, 
        description, 
        images: campground.images,
        geometry: geoData.body.features[0].geometry
    }, 
    { 
        runValidation: true, 
        new: true 
    });
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    };
    req.flash('success', 'Successfully updated a campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
});

module.exports.deleteCampground = wrapAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds')
});

