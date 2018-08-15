const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')
const Article = mongoose.model('Article')
const fs = require('fs')
const path = require('path')

exports.queryArticleCommentsList = async (req, res, next) => {
    try {
        const list = await Comment.list({
            criteria: {
                article: req.params.articleId,
                parentComment: null
            }
        })
        return res.status(200).json({
            result: true,
            data: list
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createComment = async (req, res, next) => {
    const comment = new Comment(req.body)
    comment.author = req.user._id
    const parentComment = req.body.parentComment
    try {
        if (parentComment) {
            comment.parentComment = parentComment
            await Promise.all([
                comment.save(),
                Article.update({
                    id: req.body.article
                }, {
                    $push: {
                        comments: comment._id
                    }
                })
                .exec(),
                Comment.update({
                    _id: parentComment
                }, {
                    $push: {
                        comments: comment._id
                    }
                }).exec()
            ])
        } else {
            await Promise.all([
                comment.save(),
                Article.update({
                    id: req.body.article
                }, {
                    $push: {
                        comments: comment._id
                    }
                })
                .exec()
            ])
        }
        res.status(200).json({
            result: true,
            msg: comment.reply ? '回复成功' : '评论成功',
            data: {
                comment,
                author: req.user
            }
        })
    } catch (err) {
        next(err)
    }
}

exports.getEmoji = (req, res, next) => {
    fs.readdir(path.join(__dirname, '../public/assets/emoji'), (err, emojis) => {
        if (err) return next(err)
        let lastPot
        return res.status(200).json({
            result: true,
            data: emojis.map(el => {
                lastPot = el.lastIndexOf('.')
                return {
                    src: `/public/assets/emoji/${el}`,
                    name: el.slice(0, lastPot)
                }
            })
        })
    })
}