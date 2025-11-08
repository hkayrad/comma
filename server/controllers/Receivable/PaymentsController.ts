import express from 'express';
import verifyUser from '../../utils/verifyUser';
import ReceivablePaymentsService from '../../services/Receivable/PaymentsService';
import dataMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(dataMiddleware);

router.post('/payments', async (req, res) => {
    const payment = req.body;
    const response = await ReceivablePaymentsService.Create(payment, req.companyId);
    res.json(response);
});

router.get('/payments', async (req, res) => {
    const response = await ReceivablePaymentsService.GetAll(req.companyId);
    res.json(response);
});

router.put('/payments/:id', async (req, res) => {
    const { id } = req.params;
    const payment = req.body;
    const response = await ReceivablePaymentsService.Update(id, payment, req.companyId);
    res.json(response);
});

router.delete('/payments/:id', async (req, res) => {
    const paymentId = req.params.id;
    const response = await ReceivablePaymentsService.Delete(paymentId, req.companyId);
    res.json(response);
});

export default router;