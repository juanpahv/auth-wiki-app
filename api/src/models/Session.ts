import User from './entities/User';
import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import HTTPStatusCodes from 'http-status-codes';
import superSecretDontPushJson from '../../superSecretDontPush.json';

export default class Session{
    public tokenSesion : string;

    private static secret = superSecretDontPushJson.Secret;

    private constructor (token:string){
        this.tokenSesion = token;
    }

    public static crearSesionParaUsuario (user: User): Session{
        const data = {
            emailUser: user.mail,
            UsernameUser: user.username
        };
        const tokenSesion = jwt.sign(
            {data},
            Session.secret,
            {expiresIn: '1d'}
        );
        return new Session(tokenSesion);
    }

    public static ValidarSesion(req: Request, res: Response, next: NextFunction): void{
        try{
            const tokenSesion = <string>req.headers['token-session'];
            if(!tokenSesion){
                res.status(HTTPStatusCodes.UNAUTHORIZED).json({
                    message:"Session token wasn't sent"
                })
                return;
            }
            jwt.verify(tokenSesion, Session.secret);
            next();
        }catch(e){
            console.log(e);
            res.status(HTTPStatusCodes.UNAUTHORIZED).json({
                message: 'Invalid session'
            });
        }
    }
}