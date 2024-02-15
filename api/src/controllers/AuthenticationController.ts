import { Request, Response, Application } from 'express';
import HttpStatusCodes from 'http-status-codes';
import User from '../models/entities/User';
import Session from '../models/Session';
import BaseController from './BaseController';

interface LoginRequestBody {
    nombreUsuario: string;
    password: string;
}
interface RegistroRequestBody extends LoginRequestBody{
    mail: string;
}

export default class AuthenticationController extends BaseController {
    protected initializeRouter(): void {
        this.router.post('/signUp', this.registro);
        this.router.post('/logIn', this.iniciarSesion);
    }

    private async registro(req: Request, res: Response): Promise<void> {
        try {
            const {
                nombreUsuario,
                password,
                mail
            } = <RegistroRequestBody>req.body;

            if (!nombreUsuario || !password || !mail) {
                res.status(HttpStatusCodes.BAD_REQUEST).end();
                return;
            }

            const repositoryUser = await User.getRepositoryUser();

            const nuevoUsuario = await repositoryUser.save(new User(nombreUsuario, password, mail));

            const sesion = Session.crearSesionParaUsuario(nuevoUsuario);

            res.status(HttpStatusCodes.OK).json(sesion);
        } catch (e) {
            if (e instanceof Error && e.message === 'ErrorNombreUsuarioDuplicado') {
                res.status(HttpStatusCodes.CONFLICT).json({ mensaje: 'Ya existe un usuario con el mismo nombre de usuario.' });
                return;
            }

            //console.error(e);
            res.status(HttpStatusCodes.CONFLICT).end();
        }
    }
    private async iniciarSesion(req: Request, res: Response): Promise<void> {
        try {
            const { nombreUsuario, password } = <LoginRequestBody>req.body;

            if (!nombreUsuario || !password) {
                res.status(HttpStatusCodes.BAD_REQUEST).end();
                return;
            }

            const usuario = await User.buscarPorNombreUsuarioYPassword(nombreUsuario, password);

            const sesion = Session.crearSesionParaUsuario(usuario);

            res.status(HttpStatusCodes.OK).json(sesion);    
        } catch (e) {
            if (e instanceof Error && e.message === 'ErrorUsuarioNoEncontrado') {
                res.status(HttpStatusCodes.UNAUTHORIZED).end();
                return;
            }

            console.error(e);
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).end();
        }
    }
    
    public static mount(app: Application): AuthenticationController {
        return new AuthenticationController(app, '/auth');
    }

}
