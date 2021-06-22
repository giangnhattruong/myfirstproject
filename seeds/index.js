if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

mongoose = require('mongoose');
const axios = require('axios');
const Campground = require('../models/campground');
const cities = require('../seeds/cities');
const { places, descriptors } = require('../seeds/seedHelpers')
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

mongoose.connect('mongodb://localhost:27017/campingApp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
//Test connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected")
})

// random in array
const arrayRandom = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const getRandomImage = async () => {
    try {
        const unsplashApi = 'https://api.unsplash.com/photos/random?collections=4803919&&client_id=' + process.env.UNSPLASH_API_KEY;
        const response = await axios.get(unsplashApi);
        return response.data.urls.small;
    } catch (e) {
        return "Oh no error!";
    }
}

//put all in async function in order to do await
//await delete all DB each time runing seeds index.js
const seedDB = async () => {
    await Campground.deleteMany({});
    // const geoDataDefault = await geocoder.forwardGeocode({
    //     query: 'New York, New York',
    //     limit: 1
    // }).send()
    //iterate all seeds to push in array, then insert to DB
    for (let n = 0; n < 45; n++) {
        let price = Math.floor(Math.random() * 600) + 300;
        let randomCity = Math.floor(Math.random() * 1000) + 1;
        let location = cities[randomCity].city + ' ' + cities[randomCity].state;
        // const geoData = await geocoder.forwardGeocode({
        //     query: location,
        //     limit: 1
        // }).send()
        // let geometry = [];
        // if (!geoData) {
        //     geometry = geoDataDefault.body.features[0].geometry;
        // } else {
        //     geometry = geoData.body.features[0].geometry;
        // }
        // console.log(geometry)
        const camp = new Campground({
            author: '60c4774f864c6712c4c9224c',
            title: `${arrayRandom(descriptors)} ${arrayRandom(places)}`,
            price,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam facere quaerat eos consequatur illo ad? Laudantium, accusamus fugiat! Voluptatibus mollitia ipsa consequatur velit molestiae alias quasi accusantium pariatur excepturi sint.",
            location,
            geometry: {
                type: 'Point',
                coordinates: [cities[randomCity].longitude, cities[randomCity].latitude]
            },
            images: [
                {
                    url: await getRandomImage(),
                    filename: 'UnsplashRandomPicture'
                }
            ]
        });
        await camp.save();
    }
}

//this seedDB() return a promist because it a async function
seedDB().then(() => {
    console.log('Database closed')
    mongoose.connection.close();
})
