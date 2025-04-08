import expressAsyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"

import isValidObjectId from "../../helpers/mongooseIdValidity";
import UserModel from "../../models/user";
import { IGetUserAuthInfoRequest, registerType } from "../../appTypes/types";
import sendBrevoEmail from "../../helpers/mailsSender";











export const getAllUsersAdminController = expressAsyncHandler(async (req: Request, res): Promise<void> => {

  try {
   
    const users = await UserModel.find();
    res.status(201).json({
      status: "success",
      message: "Users fetched successfuly",
      users
    });
  } catch (error) {
      if (error instanceof Error) {
          throw new Error(error.message);
      } else { 
      throw new Error("Internal server error")
      }
  }
});

export const getSingleUserAdminController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { id } = req.params;
  const isIdVallid = isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  const userFound = await UserModel.findById(id);
  if (!userFound) {
     res.status(404).json({
      status: "failed",
      message: "User not found",
     });
      return
  }

res.status(200).json({
  status: "success",
  mesage: "User fetched successfuly",
    user: userFound,
  });
});



/* forgot password */





export const deleteUserController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  
  const user = req.user
  const { id } = req.params;
  if ( user && user._id !== id) { 
    res.status(403).json({
      message: "Admine role only",
      status: "false"
    })
    return
}
  // check if id is sent
  if (!id) {
    throw new Error("Missing user Id");
  }

  // delete user

  const deletedUser = await UserModel.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new Error("Failed to delete user");
  }

   res.status(201).json({
    status: "success",
    message: "User deleted successfully",
    data: deletedUser,
  });
});

