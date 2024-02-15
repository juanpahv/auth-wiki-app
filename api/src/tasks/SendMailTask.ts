import { transporter } from '../mailer/mailer';

export default async function SendMailTask (destination: string, HTMLcontent: string, subject: string): Promise <void>{
    await transporter.sendMail({
        from: '""<wproyectoweb@gmail.com>', // sender address
        to: destination, // list of receivers
        subject: subject, // Subject line
        html: HTMLcontent, // html body
    })
}

