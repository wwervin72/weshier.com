const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

const articleSchema = new Schema({
    id: {
        type: Number
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    abstract: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: '/public/assets/defaultArticleAvatar.jpg'
    },
    user: {
        userName: {
            type: String,
            default: ''
        }
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    tags: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    heart: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]
})

articleSchema.set('toJSON', { virtuals: true })

articleSchema
    .virtual('heartLen')
    .get(function () {
        return this.heart.length
    })

articleSchema
    .virtual('commentsLen')
    .get(function () {
        return this.comments.length
    })

articleSchema.path('id')
    .validate(async function (id) {
        const Article = mongoose.model('Article')
        if (this.isNew) {
            try {
                const exist = await Article
                    .findOne({id})
                    .exec()
                if (exist) return false
                else return true
            } catch (err) {
                return false
            }
        } else return true
    }, '文章ID已存在')
articleSchema.path('title').validate(title => title.length, '文章标题不能为空')
// articleSchema.path('content').validate(content => content.length, '文章内容不能为空')
articleSchema.path('author').validate(author => author.length, '文章标题不能为空')
articleSchema.path('tags').validate(tags => tags.length <= 10, '最多十个标签')

articleSchema.path('createdAt').get(value => moment(value).format('YYYY-MM-DD HH:mm:ss'))
articleSchema.path('updateAt').get(value => moment(value).format('YYYY-MM-DD HH:mm:ss'))

// articleSchema.set('toJSON', { getters: true, virtuals: false });

articleSchema.methods = {
    uploadAndSave (image) {
        const err = this.validateSync()
        if (err && err.toString()) throw new Error(err.toString())
        return this.save()
    },
    addComment (user, comment) {
        this.comments.push(comment._id)
        // TODO:
        // 评论了之后需要发送邮件
        return this.save()
    },
    removeComment (commentId) {
        const index = this.comments.indexOf(commentId)
        if (~index) this.comments.splice(index, 1)
        else throw new Error('没有找到该评论')
        return this.save()
    }
}

articleSchema.statics = {
    load (option) {
        option.select = option.select || 'id title abstract avatar'
        return this.findOne(option.criteria)
            .select(option.select)
            .exec()
    },
    list (option) {
        const criteria = option.criteria || {};
        const select = option.select || 'id title abstract avatar updateAt tags heart comments'
        const pageNum = option.pageNum || 0;
        const pageSize = option.pageSize || 10;
        return this
            .find(criteria)
            .select(select)
            .populate('author', 'userName alias avatar')
            .sort({ updateAt: -1 })
            .limit(pageSize)
            .skip(pageSize * pageNum)
            .exec();
    },
    countHeart () {
        return this.aggregate([
            {
                $project: {
                    countOfHeart: {
                        $size: '$heart'
                    }
                }
            }
        ])
    },
    countComment () {
        return this.aggregate([
            {
                $project: {
                    countOfComment: {
                        $size: '$comments'
                    }
                }
            }
        ])
    },
    countByUser () {
    }
}

mongoose.model('Article', articleSchema)