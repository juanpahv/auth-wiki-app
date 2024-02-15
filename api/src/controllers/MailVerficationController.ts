import { Application, Request, Response } from "express";
import BaseController from "./BaseController";
import HttpStatusCodes from 'http-status-codes';
import MailVerificationCode from "../models/entities/MailVerificationCode";
import Session from "../models/Session";
import User from "../models/entities/User";
import SendMailTask from "../tasks/SendMailTask";

interface sendMailVerificationMailBody{
    mail: string;
}
interface verifyMailBody{
    mailVerificationCodeId: number;
}

export default class MailVerificationController extends BaseController{
    protected initializeRouter(): void {
        this.router.all('*', Session.ValidarSesion);
        this.router.get('/sendVerificationMail', this.sendMailVerificationMail);
        this.router.post('/verifyMail', this.verifyMail)
    }

    private async sendMailVerificationMail(req: Request, res: Response): Promise<void>{
        try{
            const userRepository = User.getRepositoryUser();
            const {mail} = <sendMailVerificationMailBody>req.body;

            if(!mail){
                res.status(HttpStatusCodes.BAD_REQUEST).end();
                return;
            }
            const user = await (await userRepository).findOneBy({mail});
            if(!user){
                res.status(HttpStatusCodes.FORBIDDEN).end();
                return;
            }

            const mailVerificationCodeRepository = await MailVerificationCode.getMailVerificationCodeRepository();

            const mailVerificationCode = await mailVerificationCodeRepository.save(await MailVerificationCode.createMailVerificationCode(user));

            await SendMailTask(mail,`<h1>Verify mail</h1><p>click the following link to verify your mail (not ready yet, code: <b>${mailVerificationCode.id}</b></p>`,'Verify mail');

            res.status(HttpStatusCodes.OK).end();
        }catch(e){
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).end();
            console.error(e);
        }
    }

    private async verifyMail(req: Request, res: Response): Promise<void>{
        try{
            const {mailVerificationCodeId} = <verifyMailBody> req.body;

            if(!mailVerificationCodeId){
                res.status(HttpStatusCodes.BAD_REQUEST).end();
                return;
            }

            const mailVerificationCodeRepository = await MailVerificationCode.getMailVerificationCodeRepository();

            const mailVerificationCodes = (await mailVerificationCodeRepository.find({
                relations: {
                    user: true,
                },
            }));
            var mailverifactioncode : MailVerificationCode

            mailVerificationCodes.forEach(element => {
                if (element.id == mailVerificationCodeId){
                    mailverifactioncode = element;
                    return;
                }
            });

            if(!(mailverifactioncode!)){
                res.status(HttpStatusCodes.FORBIDDEN).end();
                return;
            }

            const fiveMinutesInMiliseconds = 10 * 60 * 1000;
            if(((new Date()).getTime() - mailverifactioncode.creationDateTime.getTime()) < fiveMinutesInMiliseconds){
                res.status(HttpStatusCodes.FORBIDDEN).end();
                return;
            }
            
            const userRepository = await User.getRepositoryUser();
            const user = mailverifactioncode.user;
            
            if(!user){
                res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).end();
                return;
            }
            user.isVerified = true;
            user.updateDateTime = new Date();
            await userRepository.save(user);

            res.status(HttpStatusCodes.OK).end();
        }catch(e){
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).end();
            console.error(e);
        }
    }

    public static mount(app: Application): MailVerificationController {
        return new MailVerificationController(app, '/verifyEmail');
    }
}