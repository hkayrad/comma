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
    const response = await CustomersService.GetAll(req, res);
    res.json(response);
});

router.get('/customers/names-ids', async (req, res) => {
    const response = await CustomersService.GetCustomerNamesAndIds(req, res);
    res.json(response);
});

export default router;