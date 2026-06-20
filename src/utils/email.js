const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'recover.pddfa@gmail.com',
        pass: process.env.APP_EMAIL_PASSWORD
    }
});


const sendEmail = async (to, subject, html, result) => {
    try {
        let mailOptions = {
            from: 'recover.pddfa@gmail.com',
            to,
            subject,
            html
        }
        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendEmail
}