import express from 'express'
import { loginMiddleware,registerMiddleware} from '../MiddleWare/authorisation.js';
import { loginController,registerController,logoutController } from '../Controller/login_register_logout.js';

const authRoute = express.Router();

authRoute.post('/login',loginMiddleware,loginController);

authRoute.post('/register',registerMiddleware,registerController);

authRoute.post('/logout',logoutController);


export default authRoute;