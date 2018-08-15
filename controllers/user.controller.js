const passport = require('passport')
const { respondOrRedirect } = require('../utils/')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const upload = require('../config/upload')
const Article = mongoose.model('Article')
const { sendEmail } = require('../config/mailer')
const { createAuthCode } = require('../utils')
const ejs = require('ejs')
const path = require('path')
const { saveRedisKey, verifyRedisKeyVal, expireRedisKey } = require('../dataBase/redis')

/**
 * 渲染登录界面
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.renderSignIn = (req, res, next) => {
    res.render('signIn.html', {
        env: process.env.NODE_ENV,
        msg: req.flash()
    })
}

/**
 * 渲染注册界面
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.renderSignUp = async (req, res, next) => {
    await res.render('signUp.html', {
        env: process.env.NODE_ENV
    })
}

exports.renderMemberHome = async (req, res, next) => {
    try {
        let result = await Promise.all([
            User
                .findOne({ 
                    userName: req.params.userName
                })
                .exec(),
            Article
                .find({
                    'user.userName': req.params.userName
                })
                .select('tags id heart')
                .exec()
        ])
        const member = result[0]
        // 把查询到的标签转换为一维数组并去重
        const tags = [
            ...new Set(
                result[1].map(el => el.tags)
                    .reduce((tag, result) => {
                        return [...tag, ...result]
                    })
            )
        ]
        const listCount = result[1].length
        let heartCount = result[1].map(el => el.heartLen).reduce((el, num) => el + num, 0)

        res.render('member.html', {
            user: req.user,
            member,
            tags,
            heartCount,
            listCount,
            env: process.env.NODE_ENV
        })
    } catch (err) {
        next(err)
    }
}

exports.renderSetting = (req, res, next) => {
    res.render('setting.html', {
        user: req.user,
        env: process.env.NODE_ENV
    })
}

/**
 * 登录操作
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signIn = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(200).json({
            result: false,
            msg: info.message
        })
        req.session.user = user
        return res.status(200).json({
            result: true,
            data: user,
            msg: info.message
        })
    })(req, res, next)
}

/**
 * 登出
 */
exports.signOut = async (req, res, next) => {
    req.logout()
    res.cookie('userName', '', {
        maxAge: -1
    })
    res.redirect('/')
}

/**
 * 注册操作
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signUp = async (req, res, next) => {
    const user = new User(req.body)
    const authCodeKey = `signUpCode-${user.email}`
    user.provider = 'local'
    try {
        const verifyAuthCode = await verifyRedisKeyVal(authCodeKey, req.body.authCode)
        if (!verifyAuthCode) {
            return res.status(200).json({
                result: false,
                msg: '验证码不正确'
            })
        }
        await user.save()
        expireRedisKey(authCodeKey)
        return res.status(200).json({
            result: true,
            msg: '注册成功',
            data: user
        })
    } catch (err) {
        const errors = Object.keys(err.errors).map(field => err.errors[field].message)
        res.status(200).json({
            result: false,
            msg: errors,
            data: user
        })
    }
}

/**
 * 登陆成功后跳转
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.signInRedirect = (req, res, next) => {
    const redirectTo = req.session.redirectTo ? req.session.redirectTo : '/'
    delete req.session.redirectTo
    res.cookie('userName', req.user.userName, {
        maxAge: process.env.SESSION_MAXAGE
    })
    res.redirect(redirectTo)
}

/**
 * 上传文件
 */
exports.uploadFile = (req, res, next) => {
    upload(req, res, (err, fileName) => {
        if (err) return next(err)
        return res.status(200).json({
            result: true,
            code: 200,
            data: `${process.env.UPLOAD_DIR}${req.file.filename}`
        })
    })
}

exports.renderMemberTagArticleList = async (req, res, next) => {
    try {
        const criteria = {
            'user.userName': req.params.userName,
            tags: req.params.tag
        }
        const articles = await Article.list({
            criteria,
            pageNum: req.query.pageNum || 0
        })
        const count = await Article.countDocuments(criteria)
        res.render('memberTagArticleList.html', {
            env: process.env.NODE_ENV,
            articles,
            count,
            user: req.user
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 注册发送邮箱验证码
 */
exports.sendSignUpAuthCode = async (req, res, next) => {
    const email = req.query.email
    try {
        const emailExist = await User
            .findOne({
                email
            })
            .select('_id')
            .exec()
        if (emailExist) return res.status(200).json({
            result: false,
            msg: '该邮箱已被使用'
        })
        const authCode = createAuthCode()
        const tplSaveCode = await Promise.all([
            ejs.renderFile(path.join(__dirname, '../config/mailer/templates/signUpAuthCodeTpl.ejs'), {
                authCode
            }),
            saveRedisKey(`signUpCode-${email}`, authCode)
        ])
        await sendEmail({
            to: email,
            subject: '账号注册验证码',
            html: tplSaveCode[0]
        });
        return res.status(200).json({
            result: true,
            msg: '验证码已发送到邮箱，30分钟内有效，请及时处理'
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 检测邮箱是否可用
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.verifyEmail = async (req, res, next) => {
    try {
        const exist = await User
            .findOne({
                email: req.query.email
            })
            .exec()
        if (exist) return res.status(200).json({
            result: false,
            msg: '该邮箱已被使用，请更换邮箱。'
        })
        else return res.status(200).json({
            result: true,
            msg: '该邮箱可用使用。'
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 检测用户名是否可用
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.verifyUserName = async (req, res, next) => {
    try {
        const exist = await User
            .findOne({
                userName: req.query.userName
            })
            .exec()
        if (exist) return res.status(200).json({
            result: false,
            msg: '该账号已被使用，请更换账号。'
        })
        else return res.status(200).json({
            result: true,
            msg: '该账号可用使用。'
        })
    } catch (err) {
        next(err)
    }
}