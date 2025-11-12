export class Logger {
	static table(data: any) {
		console.group("[TABLE] " + new Date().toString());
		console.table(data);
		console.groupEnd();
	}

	static debug(message: any, ...optionalParams: any[]) {
		console.debug(`[DEBUG] [${new Date().toString()}]`, message, ...optionalParams);
	}

	static info(message: any, ...optionalParams: any[]) {
		console.info(`[INFO] [${new Date().toString()}]`, message, ...optionalParams);
	}

	static warn(message: any, ...optionalParams: any[]) {
		console.warn(`[WARN] [${new Date().toString()}]`, message, ...optionalParams);
	}

	static error(message: any, ...optionalParams: any[]) {
		console.error(`[ERROR] [${new Date().toString()}]`, message, ...optionalParams);
	}
}
