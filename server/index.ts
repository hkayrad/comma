import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Logger } from './utils/logger';
import AuthController from "./controllers/AuthController";
import CustomersController from "./controllers/CustomersController";
import DebtsController from "./controllers/DebtsController";
import PaymentsController from './controllers/PaymentsController';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(AuthController);
app.use(CustomersController);
app.use(DebtsController);
app.use(PaymentsController)

const listenPort = process.env.SERVER_PORT || (() => { throw new Error("SERVER_PORT not defined"); })();
app.listen(listenPort, () => {
    Logger.log(`Server is running on port ${listenPort}`);
    Logger.log(`DB_HOST: ${process.env.DB_URL}`);
    Logger.log(`DB_USER: ${process.env.DB_USER}`);
    Logger.log(`DB_NAME: ${process.env.DB_NAME}`);
    Logger.log(`JWT_ISSUER: ${process.env.JWT_ISSUER}`);
    Logger.log(`JWT_AUDIENCE: ${process.env.JWT_AUDIENCE}`);
    Logger.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}h`);
    Logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});