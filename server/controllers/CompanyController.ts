import express from 'express';

import dataMiddleware from '../utils/middleware';
import { CompanyService } from '../services/CompanyService';

const router = express.Router();

router.use(dataMiddleware);

router.post("/logo/small", async (req, res) => {
    const response = await CompanyService.UploadLogo('small', req.files!.logo as any, req.companyId);
    return res.json(response);
})

router.post("/logo/large", async (req, res) => {
    const response = await CompanyService.UploadLogo('large', req.files!.logo as any, req.companyId);
    return res.json(response);
})

router.get("/logos", async (req, res) => {
    const response = await CompanyService.GetLogos(req.companyId);
    return res.json(response);
});

router.delete("/logo/small", async (req, res) => {
    const response = await CompanyService.DeleteLogo('small', req.companyId);
    return res.json(response);
});

router.delete("/logo/large", async (req, res) => {
    const response = await CompanyService.DeleteLogo('large', req.companyId);
    return res.json(response);
});

export default router;