import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import verifyUser from "../utils/verifyUser";

interface AuthenticatedWebSocket extends WebSocket {
	isAlive: boolean;
	userId?: string;
	userRole?: string;
}

interface UnauthenticatedWebSocket extends WebSocket {
	isAlive: boolean;
}

export default class NotificationWebSocket {
	private wss: WebSocketServer;
	private clients: Set<AuthenticatedWebSocket> = new Set();
	private loginClients: Set<UnauthenticatedWebSocket> = new Set();

	constructor(server: Server) {
		this.wss = new WebSocketServer({ server, path: "/ws" });
		this.setup();
	}

	private setup() {
		this.wss.on("connection", (ws: AuthenticatedWebSocket, req: Request) => {
			this.authenticate(ws, req);

			ws.on("message", (data: string) => {
				try {
					const message = JSON.parse(data.toString());
					this.handleMessage(ws, message);
				} catch (error) {
					console.error("Error parsing message:", error);
				}
			});

			ws.on("close", () => {
				console.log("Client disconnected from Notification WebSocket");
			});
		});
	}

	private authenticate(ws: AuthenticatedWebSocket, req: Request) {
		console.log("New client connected to Notification WebSocket");
		const token = req.url?.split("token=")[1]?.split(";")[0];

		if (!token) {
			this.loginClients.add(ws as UnauthenticatedWebSocket);
			console.log("Unauthorized: No token provided");
			return;
		}

		const userCreds = verifyUser(token);

		if (!userCreds) {
			ws.close(1008, "Unauthorized: Invalid token");
			console.log("Unauthorized: Invalid token");
			return;
		}

		ws.isAlive = true;
		ws.userId = userCreds.id;
		ws.userRole = userCreds.role.toString();

		this.clients.add(ws);
		console.log(`Client authenticated: UserID=${ws.userId}, Role=${ws.userRole}`);
	}

	private handleMessage(ws: AuthenticatedWebSocket, message: any) {
		console.log(message);

		switch (message.type) {
			case "SEND_NOTIFICATION":
				if (ws.userRole !== "1") {
					ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized to send notifications" }));
					return;
				}

				const title = message.title;
				const body = message.body;
				const notificationType = message.notificationType || "info";
				const startTime = message.startTime || new Date().toISOString();
				const endTime = message.endTime || new Date().toISOString();

				if (notificationType === "start_maintenance" || notificationType === "end_maintenance")
					this.loginClients.forEach((client) => {
						if (client.readyState === WebSocket.OPEN) {
							client.send(
								JSON.stringify({
									type: "NOTIFICATION",
									notificationType: notificationType,
									title,
									body,
									startTime,
									endTime,
								}),
							);
						}
					});

				this.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: "NOTIFICATION",
								notificationType: notificationType,
								title,
								body,
								startTime,
								endTime,
							}),
						);
					}
				});
				break;
			case "GET_ACTIVE_USERS":
				console.log("GET_ACTIVE_USERS message received");

				if (ws.userRole !== "1") {
					ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized to get active users" }));
					return;
				}

				ws.send(
					JSON.stringify({
						type: "ACTIVE_USERS",
						userCount: this.clients.size,
					}),
				);
				break;
			default:
				this.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify({ type: "PONG", message: "Unknown message type received" }));
					}
				});
		}
	}
}
