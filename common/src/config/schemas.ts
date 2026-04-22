import { z } from "zod";

export const configSchema = z.object({
	configKey: z.string().min(1, "Config key is required").max(128, "Config key must be at most 128 characters"),
	configValue: z.string().min(1, "Config value is required").max(128, "Config value must be at most 128 characters"),
});
