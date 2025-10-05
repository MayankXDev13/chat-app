import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";


export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        req.user = await User.findById(decoded.id).select("-password");
        next();


    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        
    }
}