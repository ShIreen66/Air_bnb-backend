// const nodemailer = require('nodemailer')

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.NODE_MAIL,
//         pass: process.env.NODE_PASS,
//     }
// })

// module.exports.sendMail = (to, subject, htmlContent) => {
//     const mailOptions = {
//         from: "0606shiree@gmail.com",
//         to,
//         subject,
//         html: htmlContent
//     }
// }

// return transporter.sendMail(mailOptions, (err, info) => {
//     if (err) console.log("error in mail----->", err)
//         console.log("info------>", info)
// })

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "066shiree@gmail.com",
        pass: "gwnshovmfkoixckg",
    }
});

module.exports.sendMail = (to, subject, htmlContent) => {
    const mailOptions = {
        from: "0606shiree@gmail.com",
        to,
        subject,
        html: htmlContent
    };

    return new Promise((resolve, reject) => { // Use a Promise
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                reject(error); // Reject the Promise on error
            } else {
                console.log("Email sent successfully:", info);
                resolve(info); // Resolve the Promise on success
            }
        });
    });
};