export class Logger {
	static table(data: unknown) {
		console.group("[TABLE] " + new Date().toString());
		console.table(data);
		console.groupEnd();
	}

	static debug(message: unknown, ...optionalParams: unknown[]) {
		if (import.meta.env.VITE_NODE_ENV === "development") {
			console.log(`[DEBUG] [${new Date().toString()}]`, message, ...optionalParams);
		}
	}

	static info(message: unknown, ...optionalParams: unknown[]) {
		console.info(`[INFO] [${new Date().toString()}]`, message, ...optionalParams);
	}

	static warn(message: unknown, ...optionalParams: unknown[]) {
		console.warn(`[WARN] [${new Date().toString()}]`, message, ...optionalParams);
	}

	static error(message: unknown, ...optionalParams: unknown[]) {
		console.error(`[ERROR] [${new Date().toString()}]`, message, ...optionalParams);
	}
}
