import BaseController from "./BaseController";
import { Request, Response, Application } from "express";
import Session from  '../models/Session';
import HttpStatusCodes from 'http-status-codes';
import User from '../models/entities/User';

interface ChangePasswordBody{
    mail: string;
    oldPassword: string;
    newPassword: string;
}


export default class ChangeDataController extends BaseController{
    protected initializeRouter(): void {
        this.router.all('*',Session.ValidarSesion);
        this.router.put('/changePassword',this.ChangePassword);
    }

    private async ChangePassword (req: Request, res: Response):Promise<void>{
        
        const{
            mail,
            oldPassword,
            newPassword
        } = <ChangePasswordBody>req.body;

        if(!mail || !oldPassword || !newPassword){
            res.status(HttpStatusCodes.BAD_REQUEST).end();
            return;
        }

        try{
            const repositoryUser = await User.getRepositoryUser()
            
            const user = await repositoryUser.findOneBy({mail, password: oldPassword})

            if(!user){
                res.status(HttpStatusCodes.FORBIDDEN).end();
                return;
            }

            user.password = newPassword;

            await repositoryUser.save(user);

            res.status(HttpStatusCodes.OK).end();

        }catch(e){
            console.error(e);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).end();
            return;
        }
    }

    public static mount(app: Application): ChangeDataController {
        return new ChangeDataController(app,'/changeData');
    }

}
