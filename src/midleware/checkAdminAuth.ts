import {  Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../models/user";
import { IGetUserAuthInfoRequest } from "../appTypes/types";






export const checkAdminAuthMiddleware = async (req: IGetUserAuthInfoRequest, res:Response, next:NextFunction): Promise<void> => { 
 const userJwt = req.cookies?.token
    if (!userJwt) { 
        /* 401 status code means not authorised */
         res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return 
        
    }
    try {
        const { id } = jwt.verify(userJwt, process.env.JWT_SECRET as string) as { id: string }
        
        const user = await UserModel.findById(id)
        if (!user) { 
            res.status(404).json({ message: "User not found" ,isAuthenticated: "false" });
            return 
        }
        const { role } = user
        if (role !== "admin") {
            /* 403 status code means forbidden */
            res.status(403).json({ message: "Admin permission requred" ,isAuthenticated: "false" });
            return 
         }
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return
    }


}