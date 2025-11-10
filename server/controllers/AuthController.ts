import express from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse, Logger } from '../utils';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return ApiResponse.error("Username and password are required");
    }
    const response = await AuthService.Login(username, password);
    Logger.info(response);
    res.json(response);
});

router.post('/verify', async (req, res) => {
    const { token } = req.body;
    const decoded = await AuthService.VerifyToken(token);
    if (decoded) {
        res.json({ success: true, decoded });
    } else {
        res.json({ success: false, message: "Invalid token" });
    }
});

export default router;