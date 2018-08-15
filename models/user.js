const mongoose = require('mongoose')
const crypto = require('crypto')
const Schema = mongoose.Schema

const createNickname = () => {
	const str = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	// nickname的长度为5-10
	let nickNameLen = Math.floor(Math.random() * (10 - 5 + 1) + 5);
	let nickName = [];
	while (nickNameLen) {
		nickName[nickName.length] = str.substr(Math.floor(Math.random() * 62), 1);
		nickNameLen--;
	}
	return nickName.join('');
}

const userSchema = new Schema({
    userName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    alias: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: '/public/assets/defaultUserAvatar.png'
    },
    provider: {
        type: String,
        default: ''
    },
    hashedPassword: {
        type: String,
        default: ''
    },
    salt: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '这家伙很懒，什么都没留下'
    },
    url: {
        type: String,
        default: ''
    },
    sex: {
        type: String,
        default: 'secret',
        enum: ['male', 'female', 'secret']
    },
    attentions: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    fans: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    collections: [{
        type: Schema.ObjectId,
        ref: 'Article'
    }]
})

oAuthTypes = ['github']

userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashedPassword = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema
    .path('userName')
    .validate(function (userName) {
        if (this.skipValidation()) return true
        return /^[a-zA-Z0-9]{5,16}$/.test(userName);
    }, '账号需为5到16个长度的字母或数字')

userSchema
    .path('userName')
    .validate(async function (userName) {
        const User = mongoose.model('User')
        if (this.skipValidation()) return true
        if (this.isNew) {
            try {
                const exist = await User
                    .findOne({userName})
                    .exec()
                if (exist) return false
                else return true
            } catch (err) {
                return false
            }
        } else return true
    }, '该用户名已存在，请更换用户名')

userSchema
    .path('email')
    .validate(function (email) {
        if (this.skipValidation()) return true
        return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(email);
    }, '邮箱格式不正确')

userSchema
    .path('email')
    .validate(async function (email) {
        const User = mongoose.model('User')
        if (this.skipValidation()) return true 
        if (this.isNew || this.isModified('email')) {
            try {
                const exist = await User
                    .findOne({email})
                    .exec()
                if (exist) return false
                else return true
            } catch (err) {
                return false
            }
        } else return true
    }, '该邮箱已被使用，请更换邮箱')

userSchema
    .path('hashedPassword')
    .validate(function (hashedPassword) {
        if (this.skipValidation()) return true
        return /^[a-zA-Z0-9-_.]{5,20}$/.test(this.toObject({ virtuals: true }).password);
    }, '密码必须是长度为5到20个的字母、数字、-、_、.')

userSchema.methods = {
    skipValidation () {
        return ~oAuthTypes.indexOf(this.provider)
    },
    authenticate (pwd) {
        return this.encryptPassword(pwd) === this.hashedPassword
    },
    makeSalt () {
        return Math.round(Date.now() * Math.random()) + ''
    },
    encryptPassword (pwd) {
        if (!pwd) return ''
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(pwd)
                .digest('hex')
        } catch (err) {
            console.log(err)
            return ''
        }
    }
}

userSchema.statics = {
    load (option, cb) {
        option.select = option.select || 'userName alias provider';
        return this.findOne(option.criteria)
            .select(option.select)
            .exec(cb)
    }
}

userSchema.pre('save', function (next) {
    if (!this.alias) this.alias = createNickname()
    next()
})

mongoose.model('User', userSchema)