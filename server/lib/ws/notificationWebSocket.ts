import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { DecodedJwtToken } from "@common/types";
import { Logger } from "../utils";

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
		this.wss = new WebSocketServer({ server, path: "/notification" });
		this.setup();
	}

	private setup() {
		this.wss.on("connection", (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
			this.authenticate(ws, req);

			ws.on("message", (data: string) => {
				try {
					const message = JSON.parse(data.toString());
					this.handleMessage(ws, message);
				} catch (error) {
					Logger.error("Error parsing message:", error);
				}
			});

			ws.on("close", () => {
				Logger.info("Client disconnected from Notification WebSocket");
				this.clients.delete(ws);
			});

			ws.on("error", (error) => {
				Logger.error("WebSocket error:", error);
				this.clients.delete(ws);
			});
		});
	}

	private authenticate(ws: AuthenticatedWebSocket, req: IncomingMessage) {
		console.log("New client connected to Notification WebSocket");

		// Parse cookies from request headers
		const cookies = this.parseCookies(req.headers.cookie || "");
		const token = cookies.access_token;

		if (!token) {
			this.loginClients.add(ws as UnauthenticatedWebSocket);
			console.log("Unauthorized: No token provided");
			return;
		}

		// Verify JWT token
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
				issuer: process.env.JWT_ISSUER,
				audience: process.env.JWT_AUDIENCE,
			}) as DecodedJwtToken;

			ws.isAlive = true;
			ws.userId = decoded.id;
			ws.userRole = decoded.role.toString();

			this.clients.add(ws);
			console.log(`Client authenticated: UserID=${ws.userId}, Role=${ws.userRole}`);
		} catch (error) {
			ws.close(1008, "Unauthorized: Invalid token");
			console.log("Unauthorized: Invalid token", error);
			return;
		}
	}

	private parseCookies(cookieHeader: string): Record<string, string> {
		const cookies: Record<string, string> = {};
		if (!cookieHeader) return cookies;

		cookieHeader.split(";").forEach((cookie) => {
			const [name, ...rest] = cookie.split("=");
			const value = rest.join("=").trim();
			if (name && value) {
				cookies[name.trim()] = decodeURIComponent(value);
			}
		});

		return cookies;
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
