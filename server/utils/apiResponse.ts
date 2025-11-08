export class ApiResponse {
    static success(data: any = null, message = 'success') {
        return {
            isSuccess: true,
            status: 200,
            message: message,
            data: data
        };
    }

    static error(message: string = 'error') {
        return {
            isSuccess: false,
            status: 400,
            message: message,
            data: null
        };
    }
}