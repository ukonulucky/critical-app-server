import expressAsyncHandler from "express-async-handler"
import {  Request, Response } from "express"
import { decrypt } from "../../helpers/decrypt";
import isValidObjectId from "../../helpers/mongooseIdValidity";
import UserModel from "../../models/user";
import { IGetUserAuthInfoRequest, registerType } from "../../appTypes/types";

import BankModel from "../../models/bank";





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
  const decryptedId  = decrypt(id)
  const isIdVallid = isValidObjectId(decryptedId.toString());
  if (!decryptedId || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  const userFound = await UserModel.findById(decryptedId);
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



export const deleteUserAdminController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  
  const user = req.user
  const { id } = req.params;
  const decryptedId  = decrypt(id)
  const isIdVallid = isValidObjectId(decryptedId.toString());
  if (!decryptedId || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  // check if id is sent
 

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

export const deleteAllUserAdminController = expressAsyncHandler(async(req:Request, res:Response) => { 
  const deleteAll = await UserModel.deleteMany({});
  res.status(201).json({
    status: "success",
    message: "All users deleted successfully",
    data: deleteAll,
  });
})


// bank controllers

export const getAllAccounController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  
  // get all accounts
  const accounts = await BankModel.find({}).populate("userId").exec();

   res.status(200).json({
    status: "success",
    message: "Account fetched successfully",
    accounts
  });
});


export const getSingleAccountAdminController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { id } = req.params;
  const decryptedId  = decrypt(id)
  const isIdVallid = isValidObjectId(decryptedId.toString());
  if (!decryptedId || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  const accountFound = await BankModel.findById(decryptedId);
  if (!accountFound) {
     res.status(404).json({
      status: "failed",
      message: "Account not found",
     });
      return
  }

res.status(200).json({
  status: "success",
  mesage: "Account fetched successfuly",
    user: accountFound,
  });
});



export const createTransferPin = expressAsyncHandler(async() => { 

})
