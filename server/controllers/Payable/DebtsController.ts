import express from 'express';
import PayableDebtsService from '../../services/Payable/DebtsService';
import dataMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(dataMiddleware);

router.post('/debts', async (req, res) => {
    const debt = req.body;
    const response = await PayableDebtsService.Create(debt, req.companyId);
    res.json(response);
});

router.get('/debts/totals', async (req, res) => {
    const response = await PayableDebtsService.GetTotals(req.companyId);
    res.json(response);
});

router.get('/debts', async (req, res) => {
    const response = await PayableDebtsService.GetAll(req.companyId);
    res.json(response);
});

router.put('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const debt = req.body;
    const response = await PayableDebtsService.Update(id, debt, req.companyId);
    res.json(response);
});

router.delete('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const response = await PayableDebtsService.Delete(id, req.companyId);
    res.json(response);
});

export default router;