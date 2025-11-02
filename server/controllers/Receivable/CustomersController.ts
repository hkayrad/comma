import express from 'express';
import ReceivableCustomersService from '../../services/Receivable/CustomersService';
import verifyUser from '../../utils/verifyUser';

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
    const response = await ReceivableCustomersService.Create(customer);
    res.json(response);
});

router.get('/customers', async (req, res) => {
    const response = await ReceivableCustomersService.GetAll();
    res.json(response);
});

router.get('/customers/:id/statement', async (req, res) => {
    const { id } = req.params;
    const response = await ReceivableCustomersService.GetStatement(id);
    res.json(response);
});

router.get('/customers/id-name', async (req, res) => {
    const response = await ReceivableCustomersService.GetIdAndName();
    res.json(response);
});

router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customer = req.body;
    const response = await ReceivableCustomersService.Update(id, customer);
    res.json(response);
});

router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const response = await ReceivableCustomersService.Delete(id);
    res.json(response);
});

export default router;