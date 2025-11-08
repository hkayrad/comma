import express from 'express';
import PayableCustomersService from '../../services/Payable/CustomersService';
import authMiddleware from '../../utils/middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/customers', async (req, res) => {
    const customer = req.body;
    const response = await PayableCustomersService.Create(customer, req.companyId);
    res.json(response);
});

router.get('/customers', async (req, res) => {
    const response = await PayableCustomersService.GetAll(req.companyId);
    res.json(response);
});

router.get('/customers/:id/statement', async (req, res) => {
    const { id } = req.params;
    const response = await PayableCustomersService.GetStatement(id, req.companyId);
    res.json(response);
});

router.get('/customers/id-name', async (req, res) => {
    const response = await PayableCustomersService.GetIdAndName(req.companyId);
    res.json(response);
});

router.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const customer = req.body;
    const response = await PayableCustomersService.Update(id, customer, req.companyId);
    res.json(response);
});

router.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const response = await PayableCustomersService.Delete(id, req.companyId);
    res.json(response);
});

export default router;