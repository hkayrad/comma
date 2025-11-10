import { NextFunction, Request, Response } from "express";
import verifyUser from './verifyUser.js'
    ;

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    console.log("Auth middleware called");

    try {
        const authHeader = req.headers['authorization'];
        console.log("Authorization header:", authHeader);

        const token = authHeader?.split(' ')[1];
        console.log("Token:", token ? "present" : "absent");

        if (token == null || token === "null" || token === "undefined" || token === undefined) {
            console.log("Token validation failed");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        console.log("Attempting to verify token...");
        const decoded = verifyUser(token);
        console.log("Decoded result:", decoded);

        if (!decoded) {
            console.log("Token verification failed");
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const companyId = decoded.companyId;
        console.log("Company ID from token:", companyId);

        if (!companyId) {
            console.log("No company ID in token");
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        req.companyId = companyId;
        console.log("Auth middleware completed successfully");

        next();
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}