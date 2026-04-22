import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Server } from 'http';
import NotificationWebSocket from '@/lib/ws/notificationWebSocket';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/utils/logger';
import { UserRole } from '@common/enums';

vi.mock('ws', async () => {
    class MockWebSocketServer {
        on = vi.fn();
        clients = new Set();
    }
    return {
        WebSocketServer: MockWebSocketServer,
        WebSocket: {
            OPEN: 1,
        },
    };
});

describe('NotificationWebSocket', () => {
	let mockServer: Server;
	let notificationWS: NotificationWebSocket;

	beforeEach(() => {
		vi.restoreAllMocks();
		mockServer = {
            on: vi.fn(),
        } as unknown as Server;
		notificationWS = new NotificationWebSocket(mockServer);
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_ISSUER = 'test_issuer';
        process.env.JWT_AUDIENCE = 'test_audience';
	});

	it('should initialize WebSocketServer', () => {
        expect(notificationWS).toBeDefined();
	});

    describe('authenticate', () => {
        it('should add client to loginClients if no token', () => {
            const ws: any = { };
            const req: any = { headers: { } };
            const spy = vi.spyOn(Logger, 'warn');
            
            // @ts-ignore
            notificationWS.authenticate(ws, req);
            
            expect(spy).toHaveBeenCalledWith('Unauthorized: No token provided');
        });

        it('should authenticate client if token valid', () => {
            const ws: any = { };
            const token = jwt.sign({ id: '1', role: 1 }, process.env.JWT_SECRET as string, {
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE
            });
            const req: any = { headers: { cookie: `access_token=${token}` } };
            
            // @ts-ignore
            notificationWS.authenticate(ws, req);
            
            expect(ws.userId).toBe('1');
            expect(ws.userRole).toBe('1');
        });

        it('should close connection if token invalid', () => {
            const ws: any = { close: vi.fn() };
            const req: any = { headers: { cookie: `access_token=invalid` } };
            
            // @ts-ignore
            notificationWS.authenticate(ws, req);
            
            expect(ws.close).toHaveBeenCalledWith(1008, 'Unauthorized: Invalid token');
        });
    });

    describe('handleMessage', () => {
        it('should send active users to admin', () => {
            const ws: any = { userRole: String(UserRole.ADMIN), send: vi.fn() };
            const message = { type: 'GET_ACTIVE_USERS' };
            
            // @ts-ignore
            notificationWS.handleMessage(ws, message);
            
            expect(ws.send).toHaveBeenCalledWith(expect.stringContaining('ACTIVE_USERS'));
        });

        it('should return error to non-admin for GET_ACTIVE_USERS', () => {
            const ws: any = { userRole: '1', send: vi.fn() };
            const message = { type: 'GET_ACTIVE_USERS' };
            
            // @ts-ignore
            notificationWS.handleMessage(ws, message);
            
            expect(ws.send).toHaveBeenCalledWith(expect.stringContaining('Unauthorized to get active users'));
        });

        it('should broadcast notification for admin SEND_NOTIFICATION', () => {
            const ws: any = { userRole: String(UserRole.ADMIN), send: vi.fn() };
            const message = { type: 'SEND_NOTIFICATION', title: 'Test', body: 'Body', notificationType: 'info' };
            
            const client1: any = { readyState: 1, send: vi.fn() };
            // @ts-ignore
            notificationWS.clients.add(client1);

            // @ts-ignore
            notificationWS.handleMessage(ws, message);
            
            expect(client1.send).toHaveBeenCalledWith(expect.stringContaining('NOTIFICATION'));
        });

        it('should return error to non-admin for SEND_NOTIFICATION', () => {
            const ws: any = { userRole: '1', send: vi.fn() };
            const message = { type: 'SEND_NOTIFICATION' };
            
            // @ts-ignore
            notificationWS.handleMessage(ws, message);
            
            expect(ws.send).toHaveBeenCalledWith(expect.stringContaining('Unauthorized to send notifications'));
        });

        it('should broadcast to loginClients for maintenance notifications', () => {
             const ws: any = { userRole: String(UserRole.ADMIN), send: vi.fn() };
             const message = { type: 'SEND_NOTIFICATION', title: 'M', body: 'B', notificationType: 'start_maintenance' };
             
             const loginClient: any = { readyState: 1, send: vi.fn() };
             // @ts-ignore
             notificationWS.loginClients.add(loginClient);

             // @ts-ignore
             notificationWS.handleMessage(ws, message);
             
             expect(loginClient.send).toHaveBeenCalled();
        });

        it('should return PONG for unknown message', () => {
            const ws: any = { };
            const message = { type: 'UNKNOWN' };
            
            const client1: any = { readyState: 1, send: vi.fn() };
            // @ts-ignore
            notificationWS.clients.add(client1);

            // @ts-ignore
            notificationWS.handleMessage(ws, message);
            
            expect(client1.send).toHaveBeenCalledWith(expect.stringContaining('PONG'));
        });
    });
});
