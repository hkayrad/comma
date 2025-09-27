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

router.post('/customers', async (req, res) => {
    const customer = req.body;
    const response = await CustomersService.Create(customer);
    res.json(response);
});

router.get('/customers', async (req, res) => {
    const response = await CustomersService.GetAll();
    res.json(response);
});

router.get('/customers/:id/statement', async (req, res) => {
    const { id } = req.params;
    const response = await CustomersService.GetStatement(id);
    res.json(response);
});

router.get('/customers/id-name', async (req, res) => {
    const response = await CustomersService.GetIdAndName();
    res.json(response);
});

router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customer = req.body;
    const response = await CustomersService.Update(id, customer);
    res.json(response);
});

router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const response = await CustomersService.Delete(id);
    res.json(response);
});

export default router;