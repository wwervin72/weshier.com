const path = require('path')
const uploadPath = `/data/weshier${process.env.UPLOAD_DIR}`
const markDownDir = `/data/weshier${process.env.ARTICLE_DIR}`

module.exports = {
    uploadPath,
    markDownDir
}