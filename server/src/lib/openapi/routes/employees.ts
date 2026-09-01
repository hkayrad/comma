import { registry } from "../registry";
import { z } from "zod";
import { employeeSchema, advanceSchema, garnishmentSchema, attendanceSchema, payrollSchema } from "@comma/common/schemas";

registry.registerPath({
	method: "get",
	path: "/employees/list",
	summary: "Get list of all employees",
	tags: ["Employees"],
	responses: {
		200: {
			description: "List of employees",
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						data: z.array(z.any()),
					}),
				},
			},
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/employees/list",
	summary: "Create a new employee",
	tags: ["Employees"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: employeeSchema,
				},
			},
		},
	},
	responses: {
		201: {
			description: "Employee created successfully",
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/employees/advances",
	summary: "Get employee advances",
	tags: ["Employees"],
	responses: {
		200: {
			description: "List of advances",
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/employees/garnishments",
	summary: "Get employee garnishments",
	tags: ["Employees"],
	responses: {
		200: {
			description: "List of garnishments",
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/employees/attendance",
	summary: "Get employee attendance records",
	tags: ["Employees"],
	responses: {
		200: {
			description: "List of attendance records",
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/employees/payroll",
	summary: "Get employee payroll records",
	tags: ["Employees"],
	responses: {
		200: {
			description: "List of payroll records",
		},
	},
});
