const mongoose = require('mongoose')
const Article = mongoose.model('Article')
const User = mongoose.model('User')
const only = require('only')
const fs = require('fs')
const path = require('path')
const { markDownDir } = require('../config')

/**
 * 渲染首页
 */
exports.index = async (req, res, next) => {
    try {
        const articles = await Article.list({
            pageNum: 0
        })
        const count = await Article.countDocuments()
        res.render('index.html', {
            user: req.user,
            articles,
            count,
            env: process.env.NODE_ENV,
            title: 'weshier'
        })
    } catch (err) {
        return next(err)
    }
}

/**
 * 加载更多
 */
exports.queryArticleList = async (req, res, next) => {
    let criteria = {}
    if (req.query.userName) criteria.userName = req.query.userName
    if (req.query.tag) criteria.tags = {
        $in: [req.query.tag]
    }
    try {
        const articles = await Article.list({
            criteria,
            pageNum: req.query.pageNum
        })
        const count = await Article.countDocuments(criteria)
        return res.status(200).json({
            result: true,
            data: articles,
            count,
            msg: '查询成功'
        })
    } catch (err) {
        return next(err)
    }
}

/**
 * 根据传入的tag查询出该tag下所有的文章列表
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.queryArticleListByTag = async (req, res, next) => {

}

exports.queryUserArticleListByTag = async (req, res, next) => {
    try {
        const list = Article
            .find({
                'user.userName': req.query.userName,
                tags: req.query.tag
            })
            .select('title abstract updateAt tags heart')
            .populate('author', 'userName alias')
            .exec()
        return res.status(200).json({
            result: true,
            data: list
        })
    } catch (err) {
        next(err)
    }
}

exports.queryMemberTags = async (req, res, next) => {
    try {
        const tags = await Article
            .find({
                'user.userName': req.params.userName
            })
            .select('tags')
            .exec()
        if (!tags) return next()
        return res.status(200).json({
            result: true,
            data: [
                ...new Set(
                    tags.map(el => el.tags)
                        .reduce((tag, result) => {
                            return [...tag, ...result]
                        })
                )
            ]
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 渲染编辑器页面
 */
exports.renderEditor = (req, res, next) => {
    res.render('editor.html', {
        env: process.env.NODE_ENV,
        user: req.user
    })
}

/**
 * 保存文章
 */
exports.createArticle = async (req, res, next) => {
    const content = req.body.content
    if (!content) return res.status(200).json({
        result: false,
        msg: '内容不能为空'
    })
    let article = new Article(only(req.body, 'title abstract tags'))
    if (req.body.avatar) article.avatar = avatar
    article.user = {
        userName: req.user.userName,
        alias: req.user.alias
    }
    article.author = req.user
    // let count
    let maxId
    try {
        // count = await Article.countDocuments({}).exec() + 1
        maxId = await Article
            .findOne({}, {
                id: 1
            })
            .sort({
                _id: -1
            })
            .limit(1)
            .exec()
        maxId = maxId ? maxId.id : 0
    } catch (err) {
        maxId = Date.now()
    }
    article.id = maxId + 1
    try {
        fs.writeFile(`${markDownDir}${article.id}.md`, content, async err => {
            if (err) return next(err)
            await article.save()
            return res.status(200).json({
                result: true,
                msg: '文章保存成功',
                data: {
                    id: article.id,
                    user: article.user
                }
            })
        })
    } catch (err) {
        return res.status(422).json({
            result: false,
            msg: '文章保存失败',
            error: err.toString(),
            data: article
        })
    }
}

/**
 * 文章详情界面
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.renderArticleDetail = async (req, res, next) => {
    const id = req.params.articleId
    try {
        const article = await Article
            .findOne({
                id,
                "user.userName": req.params.userName
            })
            .populate('author', 'userName alias avatar')
            .exec()
        if (!article) return next()
        // 查找上一篇以及下一篇
        const prevNext = await Promise.all([
            Article
                .find({
                    createdAt: {
                        $lt: new Date(article.createdAt)
                    }
                })
                .select('title id')
                .sort({
                    createdAt: -1
                })
                .limit(1)
                .exec(),
            Article
                .findOne({
                    createdAt: {
                        $gt: new Date(article.createdAt)
                    }
                })
                .select('title id')
                .exec()
        ])
        if (prevNext[1].id === article.id) prevNext[1] = null
        prevNext[0] = prevNext[0][0]
        fs.readFile(`${markDownDir}${id}.md`, 'utf8', async (err, content) => {
            if (err) return next(err)
            res.render('article.html', {
                env: process.env.NODE_ENV,
                user: req.user,
                article,
                content,
                prevNext,
                hearted: req.user ? (article.heart.indexOf(req.user._id) !== -1) : false
            })
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 查询上一篇文章
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.queryPrevArticle = async (req, res, next) => {
    try {
        const article = Article
            .findOne({
                createAt: {
                    $lte: ISODate(req.query.createAt)
                }
            })
            .exec()
        return res.status(200).json({
            result: true,
            data: article
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 查询下一篇文章
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.queryNextArticle = async (req, res, next) => {
    try {
        const article = Article
            .findOne({
                createAt: {
                    $gte: ISODate(req.query.createAt)
                }
            })
            .exec()
        return res.status(200).json({
            result: true,
            data: article
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 点赞文章
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.heartArticle = async (req, res, next) => {
    try {
        const article = await Article
            .findOne({
                id: req.query.articleId
            })
            .select('heart')
            .exec()
        if (!article) return next()
        if (article.heart.indexOf(req.user._id) !== -1) return res.status(200).json({
            result: false,
            msg: '你已经赞过该文章了，请不要重复点赞'
        })
        article.heart.push(req.user._id)
        const save = await article.save()
        res.status(200).json({
            result: true,
            msg: '点赞成功'
        })
    } catch (err) {
        next(err)
    }
}
/**
 * 取消点赞
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.cancelHeartArticle = async (req, res, next) => {
    try {
        const article = await Article
            .findOne({
                id: req.query.articleId
            })
            .select('heart')
            .exec()
        if (!article) return next()
        const index = article.heart.indexOf(req.user._id)
        if (!~index) return res.status(200).json({
            result: false,
            msg: '你还没有赞过该文章'
        })
        article.heart.splice(index, 1)
        const save = await article.save()
        res.status(200).json({
            result: true,
            msg: '点赞成功'
        })
    } catch (err) {
        next(err)
    }
}