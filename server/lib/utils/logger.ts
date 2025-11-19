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
		console.group(new Date().toString() + " [TABLE]");
		console.table(data);
		console.groupEnd();

		const message = `${new Date().toString()} [TABLE] ${JSON.stringify(data, null, 2)}`;
		Logger.writeToFile(message);
	}

	static debug(message: any, ...optionalParams: any[]) {
		console.debug(`${new Date().toString()} [DEBUG] `, message, ...optionalParams);

		const logMessage = `${new Date().toString()} [DEBUG] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static info(message: any, ...optionalParams: any[]) {
		console.info(`${new Date().toString()} [INFO] `, message, ...optionalParams);

		const logMessage = `${new Date().toString()} [INFO] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static warn(message: any, ...optionalParams: any[]) {
		console.warn(`${new Date().toString()} [WARN] `, message, ...optionalParams);

		const logMessage = `${new Date().toString()} [WARN] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static error(message: any, ...optionalParams: any[]) {
		console.error(`${new Date().toString()} [ERROR] `, message, ...optionalParams);

		const logMessage = `${new Date().toString()} [ERROR] ${message} ${optionalParams.length > 0 ? JSON.stringify(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}
}
