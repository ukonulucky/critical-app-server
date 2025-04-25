
import {  changePasswordController, changePasswordOTPVerificationController, createTransferPinController, deleteUserController, forgotPasswordController,    getBankAccountDetailsController,  getSingleUserController, logOutUserController, registerUserPhoneController, suspendedAccountActivation, userLoginController, userRegisterController, verifyBankTransferPinController, verifyEmailController, verifyUserPhoneController } from "../controllers/user/userController";

import { checkUserAuthMiddelware } from "../midleware/checkUserAuth";



const express = require('express');
const userRouter = express.Router();

/* Auth Routes */
userRouter.post("/register", userRegisterController)

userRouter.post("/login", userLoginController)


userRouter.get("/logout", checkUserAuthMiddelware, logOutUserController)


userRouter.get("/emailVerify/:email/:token", verifyEmailController)

// send user email for password change
userRouter.post("/forgotPasswordOTPSender", forgotPasswordController)

// verify OTP sent for password chnage
userRouter.post("/changePassword/OTPveirfy",changePasswordOTPVerificationController)


// update the password with the new password sent
userRouter.post("/reset-password", changePasswordController)


userRouter.post("/registerPhone",checkUserAuthMiddelware, registerUserPhoneController)

userRouter.post("/verifyPhone",checkUserAuthMiddelware, verifyUserPhoneController)


/* User Routes */


userRouter.get("/:id", checkUserAuthMiddelware, getSingleUserController)



userRouter.delete("/delete/:id",checkUserAuthMiddelware,deleteUserController )



// create payment  pin

userRouter.post("/account/transferPinCreation", checkUserAuthMiddelware,createTransferPinController)


// get ban details
userRouter.get("/account/details", checkUserAuthMiddelware,getBankAccountDetailsController)


//verify bank transfer pic

userRouter.post("/account/tranferPinVerify", checkUserAuthMiddelware,verifyBankTransferPinController)




// activete suspended account
userRouter.get("/account/suspended/activate/:id", suspendedAccountActivation)



export default userRouter


/* getBankAccountDetails */