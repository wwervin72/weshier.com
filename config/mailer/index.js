const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    host: 'smtp.163.com',
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PWD
    }
})
const from = {
    name: '微识',
    address: process.env.EMAIL_ACCOUNT
};

exports.sendEmail = option => {
    return new Promise((resolve, reject) => {
        mailTransport.sendMail({
            from,
            to: option.to,
            subject: option.subject,
            html: option.html,
            generateTextFromHtml: true
        }, function(err, info){
            if (err) reject(err)
            else resolve(info)
        });
    })
}
