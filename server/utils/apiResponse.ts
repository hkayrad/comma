export class ApiResponse {
    static success(data: any = null, message = 'success') {
        return {
            status: 200,
            message: message,
            data: data
        };
    }

    static error(message: string = 'error') {
        return {
            status: 400,
            message: message,
            data: null
        };
    }
}