import express from 'express';
import ReceivableDebtsService from '../../services/Receivable/DebtsService';
import authMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/debts', async (req, res) => {
    const debt = req.body;
    const response = await ReceivableDebtsService.Create(debt, req.companyId);
    res.json(response);
});

router.get('/debts/totals', async (req, res) => {
    const response = await ReceivableDebtsService.GetTotals(req.companyId);
    res.json(response);
});

router.get('/debts', async (req, res) => {
    const response = await ReceivableDebtsService.GetAll(req.companyId);
    res.json(response);
});

router.put('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const debt = req.body;
    const response = await ReceivableDebtsService.Update(id, debt, req.companyId);
    res.json(response);
});

router.delete('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const response = await ReceivableDebtsService.Delete(id, req.companyId);
    res.json(response);
});

export default router;