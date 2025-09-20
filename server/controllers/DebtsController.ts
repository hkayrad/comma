import express from 'express';
import verifyUser from '../utils/verifyUser';
import { DebtsService } from '../services/DebtsService';

const router = express.Router();

router.use((req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = verifyUser(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    next();
});

router.get('/debts', async (req, res) => {
    const response = await DebtsService.GetAll(req, res);
    res.json(response);
});

export default router;