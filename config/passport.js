const local = require('./passport/local')
const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = passport => {
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((id, done) => User.load({
        criteria: { _id: id },
        select: 'userName alias provider avatar'
    }, done))

    passport.use(local)
}