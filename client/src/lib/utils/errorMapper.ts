/**
 * Maps backend error messages to i18next translation keys.
 * This allows for centralized error localization.
 */
export const mapBackendErrorToTranslationKey = (error: any): string => {
	const message = error.response?.data?.message || error.message;

	if (!message) {
		return "api_errors.unknown";
	}

	const mappings: Record<string, string> = {
		"Validation failed": "api_errors.validation",
		"Resource not found": "api_errors.not_found",
		"Unauthorized": "api_errors.unauthorized",
		"Forbidden": "api_errors.forbidden",
		"Internal server error": "api_errors.internal_server_error",
		"Network Error": "api_errors.network_error",
	};

	// Check for exact match
	if (mappings[message]) {
		return mappings[message];
	}

	// Check for common patterns
	const lowerMessage = message.toLowerCase();
	if (lowerMessage.includes("not found")) {
		return "api_errors.not_found";
	}
	if (lowerMessage.includes("unauthorized")) {
		return "api_errors.unauthorized";
	}
	if (lowerMessage.includes("validation")) {
		return "api_errors.validation";
	}
	if (lowerMessage.includes("forbidden")) {
		return "api_errors.forbidden";
	}

	// If no mapping matches, return a generic key
	return "api_errors.unknown";
};
