export class Logger {
    static isDebug: boolean = import.meta.env.VITE_ENVIRONMENT !== 'production';

    static debug(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug) {
            console.groupCollapsed("%c[DEBUG]: ", "color: #34ce81;", message, ...optionalParams);
            console.trace();
            console.groupEnd();
        }
    }

    static error(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug)
            console.error("%c[ERROR]: ", "color: #ff4d4f;", message, ...optionalParams);
    }

    static warn(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug) {
            console.groupCollapsed("%c[WARN]: ", "color: #ff7300;", message, ...optionalParams);
            console.trace();
            console.groupEnd();
        }
    }

    static table(tabularData?: any, properties?: string[]) {
        if (Logger.isDebug)
            console.table(tabularData, properties);
    }
}