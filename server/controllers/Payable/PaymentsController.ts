import express from 'express';
import verifyUser from '../../utils/verifyUser';
import PayablePaymentsService from '../../services/Payable/PaymentsService';

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

router.post('/payments', async (req, res) => {
    const payment = req.body;
    const response = await PayablePaymentsService.Create(payment);
    res.json(response);
});

router.get('/payments', async (req, res) => {
    const response = await PayablePaymentsService.GetAll();
    res.json(response);
});

router.put('/payments/:id', async (req, res) => {
    const { id } = req.params;
    const payment = req.body;
    const response = await PayablePaymentsService.Update(id, payment);
    res.json(response);
});

router.delete('/payments/:id', async (req, res) => {
    const paymentId = req.params.id;
    const response = await PayablePaymentsService.Delete(paymentId);
    res.json(response);
});

export default router;