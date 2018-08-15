exports.respond = (res, tpl, obj, status) => {
    ref.format({
        html: () => res.render(tpl, obj),
        json: () => {
            if (status) return res.status(status).json(obj)
            return res.json(obj)
        }
    })
}

exports.respondOrRedirect = ({req, res}, url = '/', obj = {}, flash) => {
    res.format({
        html: () => {
            if (req && flash) req.flash(flash.type, flash.text)
            res.redirect(url)
        },
        json: () => res.json(obj)
    })
}

/**
 * 生成验证码
 */
exports.createAuthCode = (req, res, next) => {
    let len = 6
    let result = ''
    while (len > 0) {
        result += Math.floor(Math.random() * 10)
        len--
    }
    return result
}