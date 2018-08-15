require('dotenv').config()

const fs = require('fs')
const join = require('path').join
const express = require('express')
const passport = require('passport')
const connectMongodb = require('./dataBase/mongodb.js')
const models = join(__dirname, 'models')
const port = process.env.PORT || 3000

const app = express()

module.exports = app

;(async () => {
	await connectMongodb.connect()
})()

fs.readdirSync(models)
	.filter(file => ~file.search(/^[^\.].*\.js$/))
	.forEach(file => require(join(models, file)))

require('./config/passport')(passport)
require('./config/express')(app, passport)
require('./config/routes')(app, passport)

app.listen(port, () => {
	console.log(`Server is running at port ${port}`)
})
