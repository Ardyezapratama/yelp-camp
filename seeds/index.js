const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors} = require('./seedHelper');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error"));
db.once('open', () => {
    console.log('Database connected');
    
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 ) + 10;
        const camp = new Campground({
            author: '6743e7e4c957c225badbea76',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, ipsum debitis earum aperiam consequuntur quas mollitia rem eos, quis praesentium accusantium! Excepturi nemo repellendus expedita magni neque, mollitia hic consequatur.",
            price: price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ],
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dfoyyt6db/image/upload/v1732710419/YelpCamp/yrxmvcs8typ0mixtagmm.jpg',
                  filename: 'YelpCamp/yrxmvcs8typ0mixtagmm',
                },
                {
                  url: 'https://res.cloudinary.com/dfoyyt6db/image/upload/v1732710420/YelpCamp/oyjfiv1m4idpu4pffsun.jpg',
                  filename: 'YelpCamp/oyjfiv1m4idpu4pffsun',
                }
              ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});