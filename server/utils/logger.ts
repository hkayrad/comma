export class Logger {
    static log(message: any, ...optionalParams: any[]) {
        console.log(`[LOG] [${new Date().toISOString()}]`, message, ...optionalParams);
    }

    static debug(message: any, ...optionalParams: any[]) {
        console.debug(`[DEBUG] [${new Date().toISOString()}]`, message, ...optionalParams);
    }

    static info(message: any, ...optionalParams: any[]) {
        console.info(`[INFO] [${new Date().toISOString()}]`, message, ...optionalParams);
    }

    static error(message: any, ...optionalParams: any[]) {
        console.error(`[ERROR] [${new Date().toISOString()}]`, message, ...optionalParams);
    }
}