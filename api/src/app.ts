import express, { Application } from 'express';
import cors, {CorsOptions} from 'cors';
import AuthenticationController from './controllers/AuthenticationController';
import ChangeDataController from './controllers/ChangeDataController';
import MailVerificationController from './controllers/MailVerficationController';
import RecoverPasswordController from './controllers/RecoverPasswordController';

const app: Application = express();

const CorsOptions: CorsOptions={
    origin: 'http//localhost:3000',
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors());

MailVerificationController.mount(app);
AuthenticationController.mount(app);
ChangeDataController.mount(app);
RecoverPasswordController.mount(app);

export default app;