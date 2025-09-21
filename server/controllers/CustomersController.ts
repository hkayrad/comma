import express from 'express';
import { CustomersService } from '../services/CustomersService';
import verifyUser from '../utils/verifyUser';

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

router.get('/customers', async (req, res) => {
    const response = await CustomersService.GetAll();
    res.json(response);
});

router.get('/customers/names-ids', async (req, res) => {
    const response = await CustomersService.GetCustomerNamesAndIds();
    res.json(response);
});

router.post('/customers', async (req, res) => {
    const customer = req.body;
    const response = await CustomersService.Create(customer);
    res.json(response);
});

router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Customer ID is required" });
    }

    const response = await CustomersService.Delete(id);
    res.json(response);
});

router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customer = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "Customer ID is required" });
    }

    const response = await CustomersService.Update(customer);
    res.json(response);
});

export default router;