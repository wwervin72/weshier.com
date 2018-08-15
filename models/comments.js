let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');

let CommentsSchema = new Schema({
	article: {
        type: Number
	},
	author: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	content: {
		type: String,
		default: '',
		trim : true
	},
	createdAt: {
		type: Date,
		default: Date.now
    },
    reply: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    parentComment: {
        type: Schema.ObjectId,
        ref: 'Comment'
    },
	comments: [{
		type: Schema.ObjectId,
		ref: 'Comment'
	}],
	heart: {
        type: Array,
        default: []
	}
});

// 格式验证
CommentsSchema.path('article').validate(article => article.length, '评论文章不能为空');
CommentsSchema.path('content').validate(content => content.length, '评论内容不能为空');
CommentsSchema.path('author').validate(author => author.length, '评论作者不能为空');

// 格式化时间
CommentsSchema.path('createdAt').get(val => moment(val).format('YYYY-MM-DD hh:mm:ss'));

CommentsSchema.set('toJSON', {getters: true, virtuals: false});

CommentsSchema.statics = {
    list (option) {
        const criteria = option.criteria || {};
        const select = option.select || 'content createdAt heart reply parentComment'
        const pageNum = option.pageNum || 0;
        const pageSize = option.pageSize || 10;
        return this
            .find(criteria)
            .select(select)
            .populate('author', 'userName alias avatar')
            .populate({
                path: 'comments',
                select: 'content createdAt heart reply parentComment',
                populate: {
                    path: 'author',
                    select: 'userName alias'
                }
            })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * pageNum)
            .exec();
    }
}

mongoose.model('Comment', CommentsSchema);