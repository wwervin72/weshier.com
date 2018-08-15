const config = require('./')
const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const compression = require('compression')
// const mongoStore = require('connect-mongo')(session)
const redisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const cors = require('cors')
const ejs = require('ejs')
const flash = require('connect-flash')
const { client } = require('../dataBase/redis')

ejs.delimiter = process.env.DELIMITER

module.exports = (app, passport) => {
    app.use(compression({
        threshold: 512
    }))
    app.use(cors({
        origin: [],
        optionsSuccessStatus: 200,
        credentials: true
    }))
    app.use(express.static(config.root + '/public/dist/static'));
    app.use('/public/assets', express.static(config.root + '/public/assets/'));
    app.use('/public/upload', express.static(config.root + '/public/upload/'));
    if (process.env.NODE_ENV === 'development') {
        app.use(express.static(config.root + '/public/src/'));
    }

    app.set('views', config.root + `${process.env.NODE_ENV === 'production' ? '/public/dist/pages' : '/public/src/pages/'}`);
    app.engine('html', ejs.renderFile);

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
    app.use(cookieParser());
    app.use(session({
        name: 'session',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: process.env.SESSION_MAXAGE - 0,
            secret: process.env.COOKIE_SECRET
        },
        secret: process.env.SESSION_SECRET,
        store: new redisStore({
            client
        })
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash());
}