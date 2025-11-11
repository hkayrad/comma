import fs from "fs";
import path from "path";

export class Logger {
	private static logDir = path.join(process.cwd(), "./", "logs");
	private static logFile = path.join(Logger.logDir, `app-${new Date().toString()}.log`);

	private static ensureLogDirectory() {
		if (!fs.existsSync(Logger.logDir)) {
			fs.mkdirSync(Logger.logDir, { recursive: true });
		}
	}

	private static writeToFile(message: string) {
		Logger.ensureLogDirectory();
		fs.appendFileSync(Logger.logFile, message + "\n", "utf8");
	}

	static table(data: any) {
		console.group("[TABLE] " + new Date().toString());
		console.table(data);
		console.groupEnd();

		const message = `[TABLE] [${new Date().toString()}] ${JSON.stringify(data, null, 2)}`;
		Logger.writeToFile(message);
	}

	static debug(message: any, ...optionalParams: any[]) {
		console.debug(`[DEBUG] [${new Date().toString()}]`, message, ...optionalParams);

		const logMessage = `[DEBUG] [${new Date().toString()}] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static info(message: any, ...optionalParams: any[]) {
		console.info(`[INFO] [${new Date().toString()}]`, message, ...optionalParams);

		const logMessage = `[INFO] [${new Date().toString()}] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static warn(message: any, ...optionalParams: any[]) {
		console.warn(`[WARN] [${new Date().toString()}]`, message, ...optionalParams);

		const logMessage = `[WARN] [${new Date().toString()}] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static error(message: any, ...optionalParams: any[]) {
		console.error(`[ERROR] [${new Date().toString()}]`, message, ...optionalParams);

		const logMessage = `[ERROR] [${new Date().toString()}] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}
}
