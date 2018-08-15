const path = require('path')
const uploadPath = path.join(__dirname, `../..${process.env.UPLOAD_DIR}`)
const markDownDir = path.join(__dirname, `../..${process.env.ARTICLE_DIR}`)

module.exports = {
    uploadPath,
    markDownDir
}