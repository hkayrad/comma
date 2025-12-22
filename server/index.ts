import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import http from "http";
import fileUpload from "express-fileupload";
import AuthController from "./controllers/AuthController";
import ConfigController from "./controllers/ConfigController";
import ReceivableCustomersController from "./controllers/Receivable/CustomersController";
import ReceivableDebtsController from "./controllers/Receivable/DebtsController";
import ReceivablePaymentsController from "./controllers/Receivable/PaymentsController";
import PayableCustomersController from "./controllers/Payable/CustomersController";
import PayableDebtsController from "./controllers/Payable/DebtsController";
import PayablePaymentsController from "./controllers/Payable/PaymentsController";
import NotificationWebSocket from "./lib/ws/notificationWebSocket";
import TcmbController from "./controllers/TcmbController";
import CompanyController from "./controllers/CompanyController";
import CompanyManagementController from "./controllers/Admin/CompanyManagementController";
import { Logger } from "./lib/utils/logger";
import { sequelize } from "./lib/db/sequelize";

declare global {
	namespace Express {
		interface Request {
			user: any;
		}
	}
}

dotenv.config();

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

new NotificationWebSocket(server);

app.use(
	cors({
		origin:
			process.env.CLIENT_URL ||
			(() => {
				throw new Error("CLIENT_URL not defined");
			})(),
		credentials: true,
	}),
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
	fileUpload({
		tempFileDir: "/tmp/",
		createParentPath: true,
		limits: { fileSize: 1024 * 1024 * 2 }, // 2 MB
		safeFileNames: true,
		preserveExtension: true,
		useTempFiles: true,
	}),
);

app.use(
	"/uploads",
	express.static("uploads", {
		setHeaders: (res) => {
			res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
			res.setHeader("Access-Control-Allow-Credentials", "true");
		},
	}),
);

app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.get("/logo-proxy/:filename", (req, res) => {
	const filename = req.params.filename;
	// Security check: prevent directory traversal
	if (filename.includes("..") || filename.includes("/")) {
		res.status(400).send("Invalid filename");
		return;
	}

	const filePath = path.join(process.cwd(), "uploads", "logos", filename);

	// Check if file exists
	if (!fs.existsSync(filePath)) {
		res.status(404).send("File not found");
		return;
	}

	// Set CORS headers explicitly
	res.setHeader("Access-Control-Allow-Origin", "*");

	// Send file
	res.sendFile(filePath);
});

app.use(AuthController);
app.use("/configs", ConfigController);
app.use("/tcmb", TcmbController);

app.use("/companies", CompanyController);

app.use("/receivables", ReceivableCustomersController);
app.use("/receivables", ReceivableDebtsController);
app.use("/receivables", ReceivablePaymentsController);

app.use("/payables", PayableCustomersController);
app.use("/payables", PayableDebtsController);
app.use("/payables", PayablePaymentsController);

app.use("/admin/companies", CompanyManagementController);

const listenPort =
	process.env.SERVER_PORT ||
	(() => {
		throw new Error("SERVER_PORT not defined");
	})();

server.listen(listenPort, async () => {
	Logger.info(`Server has been started`);

	try {
		await sequelize.authenticate();
		Logger.info("Database connection established successfully.");
	} catch (error) {
		Logger.error("Unable to connect to the database:", error);
	}

	Logger.table({
		"Server Port": listenPort,
		"Client URL": process.env.CLIENT_URL,
		"Database Host": process.env.DB_URL,
		"Database User": process.env.DB_USER,
		"Database Name": process.env.DB_NAME,
		"JWT Issuer": process.env.JWT_ISSUER,
		"JWT Audience": process.env.JWT_AUDIENCE,
		"Refresh Token Expires In": `${process.env.JWT_EXPIRES_IN} (days)`,
		"Node Environment": process.env.NODE_ENV,
	});
});
