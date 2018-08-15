const ArticleCtrl = require('../controllers/article.controller')
const UserCtrl = require('../controllers/user.controller')
const CommentCtrl = require('../controllers/comment.controller')
const pageRouter = require('express').Router()
const apiRouter = require('express').Router()

const { requireSignIn, verifyLoginPrams } = require('./middlewares/authorization.js')

module.exports = (app, passport) => {
    const pauth = passport.authenticate.bind(passport)

    // 首页
    pageRouter.get('/', ArticleCtrl.index)
    // 登录界面
    pageRouter.get('/signIn', UserCtrl.renderSignIn)
    // 登录
    apiRouter.post('/signIn',
        verifyLoginPrams, 
        pauth('local', {
            failureRedirect: '/signIn'
        }), UserCtrl.signInRedirect)
    // 登出
    apiRouter.get('/signOut', UserCtrl.signOut)
    // 获取emoji
    apiRouter.get('/emoji', CommentCtrl.getEmoji)
    // 注册界面
    pageRouter.get('/signUp', UserCtrl.renderSignUp)
    // 注册
    apiRouter.post('/signUp', UserCtrl.signUp)
    // 检测邮箱是否可用
    apiRouter.get('/useable/email', UserCtrl.verifyEmail)
    // 检测用户名是否可用
    apiRouter.get('/useable/userName', UserCtrl.verifyUserName)
    // 注册发送邮件
    apiRouter.get('/email/signUp/authCode', UserCtrl.sendSignUpAuthCode)
    // 编辑器界面
    pageRouter.get('/editor', requireSignIn, ArticleCtrl.renderEditor)
    // 保存文章
    apiRouter.post('/a/save', requireSignIn, ArticleCtrl.createArticle)
    // 文章详情
    pageRouter.get('/:userName/a/:articleId', ArticleCtrl.renderArticleDetail)
    // 点赞文章
    apiRouter.get('/a/heart', requireSignIn, ArticleCtrl.heartArticle)
    // 取消点赞
    apiRouter.get('/a/hearted', requireSignIn, ArticleCtrl.cancelHeartArticle)
    // 评论文章
    apiRouter.post('/comment/new', requireSignIn, CommentCtrl.createComment)
    // 获取文章下的评论列表
    apiRouter.get('/c/:articleId', CommentCtrl.queryArticleCommentsList)
    // 加载文章列表
    apiRouter.get('/a/list', ArticleCtrl.queryArticleList)
    // 个人主页界面
    pageRouter.get('/m/:userName', UserCtrl.renderMemberHome)
    // 个人标签分类界面
    pageRouter.get('/m/:userName/t/:tag', UserCtrl.renderMemberTagArticleList)
    // 查询个人标签
    apiRouter.get('/tags/:userName', ArticleCtrl.queryMemberTags)
    // 修改基本信息界面
    pageRouter.get('/setting/basic', requireSignIn, UserCtrl.renderSetting)
    // 上传图片
    apiRouter.post('/file', UserCtrl.uploadFile)
    // tag分类列表
    pageRouter.get('/t/:tagName', ArticleCtrl.queryArticleListByTag)
    // member下的tag文章列表
    pageRouter.get('/m/t/:userName/:tagName', ArticleCtrl.queryUserArticleListByTag)
    
    app.use(pageRouter);
    app.use('/api', apiRouter);

    app.use((err, req, res, next) => {
        if (err.message
            && (~err.message.indexOf('not found')
                || (~err.message.indexOf('Cast to ObjectId failed'))
                || (~err.message.indexOf('no such file or directory'))
            )
        ) {
            return next();
        }
        if (err.stack.includes('ValidationError')) {
            res.status(422).render('422', { 
                user: req.user,
                error: err.stack,
                env: process.env.NODE_ENV
            });
            return;
        }
        res.status(500).render('500.html', {
            error: err.stack,
            user: req.user,
            env: process.env.NODE_ENV
        })
    })

    app.use((req, res) => {
        res.render('notFound.html', {
            user: req.session.user,
            env: process.env.NODE_ENV
        })
    })
}