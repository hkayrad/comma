import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import fileUpload from "express-fileupload";
import AuthController from "@/controllers/AuthController";
import ConfigController from "@/controllers/ConfigController";
import ReceivableCustomersController from "@/controllers/Receivable/CustomersController";
import ReceivableDebtsController from "@/controllers/Receivable/DebtsController";
import ReceivablePaymentsController from "@/controllers/Receivable/PaymentsController";
import PayableCustomersController from "@/controllers/Payable/CustomersController";
import PayableDebtsController from "@/controllers/Payable/DebtsController";
import PayablePaymentsController from "@/controllers/Payable/PaymentsController";
import NotificationWebSocket from "@/lib/ws/notificationWebSocket";
import TcmbController from "@/controllers/TcmbController";
import CompanyController from "@/controllers/CompanyController";
import CompanyManagementController from "@/controllers/Admin/CompanyManagementController";
import UserManagementController from "@/controllers/Admin/UserManagementController";
import AuditLogController from "@/controllers/Admin/AuditLogController";
import UserSettingsController from "@/controllers/UserSettingsController";
import TwoFactorController from "@/controllers/TwoFactorController";
import StatsController from "@/controllers/StatsController";
import PortalController from "@/controllers/PortalController";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiSpec } from "@/lib/openapi/generator";
import { env } from "@/lib/utils/env";
import { Logger } from "@/lib/utils/logger";
import { sequelize } from "@/lib/db/sequelize";
import { recreateDatabaseViews } from "@/lib/db/views";
import { errorHandler } from "@/lib/utils/middleware/errorHandler";
import { globalRateLimiter } from "@/lib/utils/middleware/rateLimiter";

export interface AuthenticatedUser {
	id: string;
	companyId: string;
	username: string;
	role: number;
}

declare global {
	namespace Express {
		interface Request {
			user: AuthenticatedUser;
		}
	}
}

const START_TIME = Date.now();

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(globalRateLimiter);

new NotificationWebSocket(server);

app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	}),
);
app.use(express.json());
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
			res.setHeader("Access-Control-Allow-Origin", env.CLIENT_URL);
			res.setHeader("Access-Control-Allow-Credentials", "true");
		},
	}),
);

app.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		time: new Date(Date.now()).toISOString(),
		uptime: `${Date.now() - START_TIME} ms`
	});
});

app.get("/logo-proxy/:filename", (req, res) => {
	const filename = path.basename(req.params.filename);
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
app.use("/admin/users", UserManagementController);
app.use("/admin", AuditLogController);

app.use("/settings", UserSettingsController);
app.use("/2fa", TwoFactorController);
app.use("/stats", StatsController);
app.use("/portal", PortalController);

if (!env.isProduction) {
	const openApiSpec = generateOpenApiSpec();
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

// Global error handler — must be registered AFTER all routes
app.use(errorHandler);

export { app };

if (env.NODE_ENV !== "test") {
	const listenPort = env.SERVER_PORT;

	server.listen(listenPort, async () => {
		Logger.info(`Server has been started`);

		try {
			await sequelize.authenticate();
			Logger.info("Database connection established successfully.");
			await recreateDatabaseViews(sequelize);
		} catch (error) {
			Logger.error("Unable to connect to the database:", error);
		}

		Logger.table({
			"Node Environment": env.NODE_ENV,
			"Server Port": listenPort,
			"Database Status": "Connected",
			"JWT Status": "Initialized",
		});
	});
}
