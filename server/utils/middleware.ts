import { NextFunction, Request, Response } from "express";
import verifyUser from './verifyUser.js'
    ;

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log("Auth middleware called");

    try {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log("Token:", token ? "present" : "absent");

        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

        const decoded = verifyUser(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        console.log("Decoded:", decoded);

        const companyId = decoded.companyId;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        req.companyId = companyId;

        next();
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}