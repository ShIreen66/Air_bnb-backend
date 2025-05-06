const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODE_MAIL,
        pass: process.env.NODE_PASS,
    }
});

module.exports.sendMail = (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.FROM_MAIL,
        to,
        subject,
        html: htmlContent
    };

    return new Promise((resolve, reject) => { 
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                reject(error); 
            } else {
                console.log("Email sent successfully:", info);
                resolve(info); 
            }
        });
    });
};