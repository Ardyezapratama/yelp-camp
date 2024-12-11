if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ErrorExpress = require('./utils/ErrorExpress');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// Model
const User = require('./models/user');

// Routes
const userRoute = require('./routes/users');
const campRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const db_url = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(db_url);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("database connected");
});


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'publics')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", "'unsafe-eval'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfoyyt6db/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
                "https://pos.baidu.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        }
    })
);

const secret = process.env.SECRET || 'yelpcampsecrete';

app.use(session({
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
        mongoUrl: db_url,
        touchAfter: 24 * 3600,
        secret
    }),
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home Page'
    });
});

// Register Routes
app.use('/', userRoute);

// Campground Routes
app.use('/campgrounds', campRoutes);

// Review Routes
app.use('/campgrounds/:id/reviews', reviewRoutes);



app.all(/(.*)/, (req, res, next) => {
    next(new ErrorExpress('Page Not Found!', 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => console.log('Serving on port 3000'));
