import express from 'express';
import ReceivableCustomersService from '../../services/Receivable/CustomersService';
import dataMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(dataMiddleware);

router.post('/customers', async (req, res) => {
    const customer = req.body;
    const response = await ReceivableCustomersService.Create(customer, req.companyId);
    res.json(response);
});

router.get('/customers', async (req, res) => {
    const response = await ReceivableCustomersService.GetAll(req.companyId);
    res.json(response);
});

router.get('/customers/:id/statement', async (req, res) => {
    const { id } = req.params;
    const response = await ReceivableCustomersService.GetStatement(id, req.companyId);
    res.json(response);
});

router.get('/customers/id-name', async (req, res) => {
    const response = await ReceivableCustomersService.GetIdAndName(req.companyId);
    res.json(response);
});

router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customer = req.body;
    const response = await ReceivableCustomersService.Update(id, customer, req.companyId);
    res.json(response);
});

router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const response = await ReceivableCustomersService.Delete(id, req.companyId);
    res.json(response);
});

export default router;