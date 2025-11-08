import { NextFunction, Request, Response } from "express";
import verifyUser from "./verifyUser";

export default function dataMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = verifyUser(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const companyId = decoded.companyId;
    if (!companyId) {
        return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    req.companyId = companyId;

    next();
}