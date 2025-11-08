import express from 'express';
import PayablePaymentsService from '../../services/Payable/PaymentsService';
import dataMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(dataMiddleware);

router.post('/payments', async (req, res) => {
    const payment = req.body;
    const response = await PayablePaymentsService.Create(payment, req.companyId);
    res.json(response);
});

router.get('/payments', async (req, res) => {
    const response = await PayablePaymentsService.GetAll(req.companyId);
    res.json(response);
});

router.put('/payments/:id', async (req, res) => {
    const { id } = req.params;
    const payment = req.body;
    const response = await PayablePaymentsService.Update(id, payment, req.companyId);
    res.json(response);
});

router.delete('/payments/:id', async (req, res) => {
    const paymentId = req.params.id;
    const response = await PayablePaymentsService.Delete(paymentId, req.companyId);
    res.json(response);
});

export default router;