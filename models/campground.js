const mongoose = require('mongoose');
const { Schema } = mongoose; // just asign for short use
const Review = require('./review');
const { cloudinary } = require('../cloudinary');

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail')
    .get(function () {
        return this.url.replace('/upload', '/upload/w_200')
    });

const options = {toJSON: {virtuals: true}}

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, options);

campgroundSchema.virtual('properties')
    .get(function(){
        return {
            popUpMarkUp: this.title,
            location: this.location,
            link: `/campgrounds/${this._id}`
        }
    });

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground.reviews.length) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews } })
    };
    if (campground.images.length) {
        campground.images.forEach(function (image) {
            cloudinary.uploader.destroy(image.filename)
        })
    };
});

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;