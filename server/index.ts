import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import { Logger } from './utils/logger';
import AuthController from "./controllers/AuthController";
import ConfigController from "./controllers/ConfigController";
import ReceivableCustomersController from "./controllers/Receivable/CustomersController";
import ReceivableDebtsController from "./controllers/Receivable/DebtsController";
import ReceivablePaymentsController from './controllers/Receivable/PaymentsController';
import PayableCustomersController from './controllers/Payable/CustomersController';
import PayableDebtsController from './controllers/Payable/DebtsController';
import PayablePaymentsController from './controllers/Payable/PaymentsController';
import NotificationWebSocket from './utils/notificationWebSocket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const notificationWebSocket = new NotificationWebSocket(server);

app.use(cors({
    origin: process.env.CLIENT_URL || (() => { throw new Error("CLIENT_URL not defined"); })(),
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(AuthController);
app.use("/config", ConfigController);

app.use("/receivable", ReceivableCustomersController);
app.use("/receivable", ReceivableDebtsController);
app.use("/receivable", ReceivablePaymentsController);

app.use("/payable", PayableCustomersController);
app.use("/payable", PayableDebtsController);
app.use("/payable", PayablePaymentsController);

const listenPort = process.env.SERVER_PORT || (() => { throw new Error("SERVER_PORT not defined"); })();

server.listen(listenPort, () => {
    Logger.log(`Server is running on port ${listenPort}`);
    Logger.log(`DB_HOST: ${process.env.DB_URL}`);
    Logger.log(`DB_USER: ${process.env.DB_USER}`);
    Logger.log(`DB_NAME: ${process.env.DB_NAME}`);
    Logger.log(`JWT_ISSUER: ${process.env.JWT_ISSUER}`);
    Logger.log(`JWT_AUDIENCE: ${process.env.JWT_AUDIENCE}`);
    Logger.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}h`);
    Logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});