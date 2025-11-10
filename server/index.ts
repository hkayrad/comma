import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';
import fileUpload from "express-fileupload";
import AuthController from "./controllers/AuthController";
import ConfigController from "./controllers/ConfigController";
import ReceivableCustomersController from "./controllers/Receivable/CustomersController";
import ReceivableDebtsController from "./controllers/Receivable/DebtsController";
import ReceivablePaymentsController from './controllers/Receivable/PaymentsController';
import PayableCustomersController from './controllers/Payable/CustomersController';
import PayableDebtsController from './controllers/Payable/DebtsController';
import PayablePaymentsController from './controllers/Payable/PaymentsController';
import NotificationWebSocket from './utils/notificationWebSocket';
import TcmbController from './controllers/TcmbController';
import CompanyController from "./controllers/CompanyController";
import { Logger } from './utils/logger';

declare global {
    namespace Express {
        interface Request {
            companyId: string;
        }
    }
}

dotenv.config();

const app = express();
const server = http.createServer(app);

new NotificationWebSocket(server);

app.use(cors({
    origin: process.env.CLIENT_URL || (() => { throw new Error("CLIENT_URL not defined"); })(),
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
    safeFileNames: true,
    preserveExtension: true,
    useTempFiles: true
}))

app.use("/uploads", express.static("uploads"))

app.use(AuthController);
app.use("/config", ConfigController);
app.use("/tcmb", TcmbController);

app.use("/company", CompanyController);

app.use("/receivable", ReceivableCustomersController);
app.use("/receivable", ReceivableDebtsController);
app.use("/receivable", ReceivablePaymentsController);

app.use("/payable", PayableCustomersController);
app.use("/payable", PayableDebtsController);
app.use("/payable", PayablePaymentsController);

const listenPort = process.env.SERVER_PORT || (() => { throw new Error("SERVER_PORT not defined"); })();

server.listen(listenPort, () => {
    Logger.info(`Server is running on port ${listenPort}`);
    Logger.info(`DB_HOST: ${process.env.DB_URL}`);
    Logger.info(`DB_USER: ${process.env.DB_USER}`);
    Logger.info(`DB_NAME: ${process.env.DB_NAME}`);
    Logger.info(`JWT_ISSUER: ${process.env.JWT_ISSUER}`);
    Logger.info(`JWT_AUDIENCE: ${process.env.JWT_AUDIENCE}`);
    Logger.info(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}h`);
    Logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
});