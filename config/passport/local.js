const localStorategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = mongoose.model('User')

module.exports = new localStorategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, userName, password, done) {
    User.load({
        criteria: { userName },
        select: 'userName salt hashedPassword'
    }).then(user => {
        if (!user) {
            req.flash('error', '用户名不存在')
            return done(null, false)
        }
        if (!user.authenticate(password)) {
            req.flash('error', '密码错误')
            return done(null, false)
        }
        return done(null, user)
    }).catch(err => {
        req.flash('error', '账号或密码不正确')
        return done(null, false)
    })
})