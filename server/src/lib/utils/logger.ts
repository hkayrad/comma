import fs from "fs";
import path from "path";

export class Logger {
	private static logDir = path.join(process.cwd(), "./", "logs");
	private static currentStream: fs.WriteStream | null = null;
	private static currentStreamDate: string = "";

	private static getFormattedDate() {
		const now = new Date();
		const utc3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
		return utc3.toISOString().replace(/T/, " ").replace(/\..+/, "").concat(" UTC+3");
	}

	private static getLogFileName() {
		const now = new Date();
		const utc3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
		const date = utc3.toISOString().split("T")[0];
		return `${date}.log`;
	}

	private static ensureLogDirectory() {
		if (!fs.existsSync(Logger.logDir)) {
			fs.mkdirSync(Logger.logDir, { recursive: true });
		}
	}

	private static getStream(): fs.WriteStream {
		const fileName = Logger.getLogFileName();

		if (Logger.currentStream && Logger.currentStreamDate === fileName) {
			return Logger.currentStream;
		}

		if (Logger.currentStream) {
			Logger.currentStream.end();
		}

		Logger.ensureLogDirectory();
		const logPath = path.join(Logger.logDir, fileName);
		
		Logger.currentStream = fs.createWriteStream(logPath, { flags: 'a' });
		Logger.currentStreamDate = fileName;

		return Logger.currentStream;
	}

	private static writeToFile(message: string) {
		try {
			const stream = Logger.getStream();
			stream.write(message + "\n");
		} catch (error) {
			console.error("Failed to write to log file:", error);
		}
	}

	private static sanitize(input: any): string {
		const str = typeof input === "string" ? input : JSON.stringify(input);
		return str.replace(/[\r\n]+/g, " ");
	}

	static table(data: any) {
		const timestamp = Logger.getFormattedDate();
		console.group(`${timestamp} [TABLE]`);
		console.table(data);
		console.groupEnd();

		const message = `${timestamp} [TABLE] ${JSON.stringify(data, null, 2)}`;
		Logger.writeToFile(message);
	}

	static debug(message: any, ...optionalParams: any[]) {
		if (process.env.NODE_ENV === "development") {
			const timestamp = Logger.getFormattedDate();
			console.debug(`${timestamp} [DEBUG] `, message, ...optionalParams);

			const logMessage = `${timestamp} [DEBUG] ${Logger.sanitize(message)} ${optionalParams.length > 0 ? Logger.sanitize(optionalParams) : ""}`;
			Logger.writeToFile(logMessage);
		}
	}

	static info(message: any, ...optionalParams: any[]) {
		const timestamp = Logger.getFormattedDate();
		console.info(`${timestamp} [INFO] `, message, ...optionalParams);

		const logMessage = `${timestamp} [INFO] ${Logger.sanitize(message)} ${optionalParams.length > 0 ? Logger.sanitize(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static warn(message: any, ...optionalParams: any[]) {
		const timestamp = Logger.getFormattedDate();
		console.warn(`${timestamp} [WARN] `, message, ...optionalParams);

		const logMessage = `${timestamp} [WARN] ${Logger.sanitize(message)} ${optionalParams.length > 0 ? Logger.sanitize(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}

	static error(message: any, ...optionalParams: any[]) {
		const timestamp = Logger.getFormattedDate();
		console.error(`${timestamp} [ERROR] `, message, ...optionalParams);

		const logMessage = `${timestamp} [ERROR] ${Logger.sanitize(message)} ${optionalParams.length > 0 ? Logger.sanitize(optionalParams) : ""}`;
		Logger.writeToFile(logMessage);
	}
}
