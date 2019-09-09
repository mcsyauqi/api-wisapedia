const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name, userId) => {
    sgMail.send({
        to: email,
        from: 'info@wisapedia.com',
        subject: 'Welcome to the app!',
        html: `Welcome to the app, ${name}. Let me know how you get along with the app. Here is your verification code: <br><strong><font size="15">${userId}</font></strong>`
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

const sendContactUsEmail = (email, name, description) => {
    sgMail.send({
        to: 'ahmadthariqsyauqi@gmail.com',
        from: 'info@wisapedia.com',
        subject: `Contact us ticket by ${name} (${email})`,
        text: description
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
    sendContactUsEmail
}