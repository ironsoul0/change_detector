const nodemailer = require('nodemailer');

const FROM = process.env.FROM;
const PASS = process.env.PASS;
const TO = 'temirzhan.yussupov@gmail.com, khafiz.batyrkhan@nu.edu.kz, rauan.omarov@nu.edu.kz';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM,
    pass: PASS
  }
 });

function sendMail(content) {
  const mailOptions = {
    from: FROM,
    to: TO,
    subject: 'Bloomberg change was detected',
    text: content
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email was sent!');
    }
  });
}

module.exports = sendMail;