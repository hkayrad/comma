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
    const response = await DebtsService.GetAll();
    res.json(response);
});

router.get('/debts/unpaid', async (req, res) => {
    const response = await DebtsService.GetAllUnpaidDebts();
    res.json(response);
});

router.get('/debts/unpaid/:customerId', async (req, res) => {
    const { customerId } = req.params;
    if (!customerId) {
        return res.status(400).json({ success: false, message: "Customer ID is required" });
    }

    const response = await DebtsService.GetUnpaidByCustomer(customerId);
    res.json(response);
});

router.get('/debts/invoice/:invoiceNo', async (req, res) => {
    const { invoiceNo } = req.params;
    if (!invoiceNo) {
        return res.status(400).json({ success: false, message: "Invoice number is required" });
    }

    const response = await DebtsService.GetByInvoiceNo(invoiceNo);
    res.json(response);
});

router.get('/debts/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Debt ID is required" });
    }

    const response = await DebtsService.GetById(id);
    res.json(response);
});

router.post('/debts', async (req, res) => {
    const debt = req.body;
    const response = await DebtsService.Create(debt);
    res.json(response);
});

router.delete('/debts/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Debt ID is required" });
    }

    const response = await DebtsService.Delete(id);
    res.json(response);
});

router.put('/debts/:id', async (req, res) => {
    const { id } = req.params;
    const debt = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "Debt ID is required" });
    }

    const response = await DebtsService.Update(debt);
    res.json(response);
});

export default router;