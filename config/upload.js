const multer = require('multer')
const { uploadPath } = require('./')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
})

module.exports = multer({ 
    storage,
    fileSize: 512 * 1024 * 1024
}).single('image')