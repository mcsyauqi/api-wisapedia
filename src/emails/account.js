const sgMail = require('@sendgrid/mail')
const mongoose = require('mongoose')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const verificationCode = new mongoose.Types.ObjectId().toString().slice(19)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'info@wisapedia.com',
        subject: 'Welcome to the app!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app. Here is your verification code: \n ${verificationCode}`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'info@wisapedia.com',
        subject: `Good bye, ${name}`,
        text: 'Sorry to see you go'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}