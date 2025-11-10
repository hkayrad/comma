import express from 'express';

import authMiddleware from '../utils/middleware';
import { CompanyService } from '../services/CompanyService';

const router = express.Router();

router.use(authMiddleware);

router.post("/logo/small", async (req, res) => {
    const companyId = req.companyId;
    const response = await CompanyService.UploadLogo('small', req.files!.logo as any, companyId);
    return res.json(response);
})

router.post("/logo/large", async (req, res) => {
    const companyId = req.companyId;
    const response = await CompanyService.UploadLogo('large', req.files!.logo as any, companyId);
    return res.json(response);
})

router.delete("/logo/small", async (req, res) => {
    const companyId = req.companyId;
    const response = await CompanyService.DeleteLogo('small', companyId);
    return res.json(response);
});

router.delete("/logo/large", async (req, res) => {
    const companyId = req.companyId;
    const response = await CompanyService.DeleteLogo('large', companyId);
    return res.json(response);
});

router.get("/logos", async (req, res) => {
    const companyId = req.companyId;
    const response = await CompanyService.GetLogos(companyId);
    return res.json(response);
});

router.get("/:id", async (req, res) => {
    const companyId = req.params.id;
    const response = await CompanyService.GetCompanyById(companyId, req.companyId);
    return res.json(response);
});

router.post("/:id", async (req, res) => {
    const companyId = req.params.id;
    const details = req.body;
    const response = await CompanyService.UpdateCompanyDetails(companyId, details);
    return res.json(response);
});

export default router;