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

router.post('/debts', async (req, res) => {
    const debt = req.body;
    const response = await DebtsService.Create(debt);
    res.json(response);
});

router.get('/debts/totals', async (req, res) => {
    const response = await DebtsService.GetTotals();
    res.json(response);
});

router.get('/debts', async (req, res) => {
    const response = await DebtsService.GetAll();
    res.json(response);
});

router.put('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const debt = req.body;
    const response = await DebtsService.Update(id, debt);
    res.json(response);
});

router.delete('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const response = await DebtsService.Delete(id);
    res.json(response);
});

export default router;