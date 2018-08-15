const mongoose = require('mongoose')
const db = process.env.MONGODB

mongoose.Promise = global.Promise

exports.connect = () => {
	let maxConnectTimes = 0;
	return new Promise((resolve, reject) => {
		mongoose.connect(db, {
			useNewUrlParser: true 
		})
		mongoose.connection.on('disconnected', () => {
			maxConnectTimes += 1
			if (maxConnectTimes < 5) {
				mongoose.connect(db, {
					useNewUrlParser: true
				})
			} else {
				throw new Error('database error')
			}
		})
		mongoose.connection.on('error', err => {
			maxConnectTimes += 1
			if (maxConnectTimes < 5) {
				mongoose.connect(db, {
					useNewUrlParser: true
				})
			} else {
				throw new Error('database error')
			}
		})
		mongoose.connection.once('open', () => {
			resolve()
			console.log('MongoDB Connected Successfully')
		})
	})
}