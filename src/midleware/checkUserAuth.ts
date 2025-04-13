import { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../models/user";
import { IGetUserAuthInfoRequest } from "../appTypes/types";






export const checkUserAuthMiddelware = async (req: IGetUserAuthInfoRequest, res:Response, next:NextFunction): Promise<void> => { 
    const userJwt = req.cookies?.token
   
    if (!userJwt) { 

         res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return 
        
    }
    try {
 
        const { id } = jwt.verify(userJwt, process.env.JWT_SECRET as string) as { id: string }

        const user = await UserModel.findById(id)
        if (!user) { 
            res.status(401).json({ message: "User not found" ,isAuthenticated: false });
            return 
        }
        req.user = user
      
        next()
    } catch (error) {
        console.log("ran here 4")
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
      
    }


}