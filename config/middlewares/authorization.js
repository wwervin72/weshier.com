const { respondOrRedirect } = require('../../utils/')

exports.requireSignIn = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    if (req.method == 'GET') req.session.redirectTo = req.originalUrl
    respondOrRedirect({ res }, '/signIn', {
        result: false,
        code: 401,
        redirect: '/signIn',
        msg: '请先登录'
    })
}

exports.verifyLoginPrams = (req, res, next) => {
    if (!req.body.userName) req.flash('error', '请输入用户名')
    if (!req.body.password) req.flash('error', '请输入密码')
    next()
}