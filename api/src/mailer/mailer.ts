import nodemailer = require('nodemailer');
import superSecretDontPushJson from '../../superSecretDontPush.json';

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
     user: 'wproyectoweb@gmail.com', // generated ethereal user
     pass: superSecretDontPushJson.EmailPassword
    }
});

transporter.verify().then(()=>{
    console.log('Ready to send emails');
})