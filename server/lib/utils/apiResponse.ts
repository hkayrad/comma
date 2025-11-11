export class ApiResponse {
	static success<T>(data: T = null!, message = "success") {
		return {
			success: true,
			status: 200,
			message: message,
			data: data,
		};
	}

	static error<T>(message: string = "error", data: T = null!) {
		return {
			success: false,
			status: 400,
			message: message,
			data: data,
		};
	}
}
