"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../controllers/user/userController");
const checkUserAuth_1 = require("../midleware/checkUserAuth");
const express = require('express');
const userRouter = express.Router();
/* Auth Routes */
userRouter.post("/register", userController_1.userRegisterController);
userRouter.post("/login", userController_1.userLoginController);
userRouter.get("/logout", checkUserAuth_1.checkUserAuthMiddelware, userController_1.logOutUserController);
userRouter.get("/emailVerify/:email/:token", userController_1.verifyEmailController);
// send user email for password change
userRouter.post("/forgotPasswordOTPSender", userController_1.forgotPasswordController);
// verify OTP sent for password chnage
userRouter.post("/changePassword/OTPveirfy", userController_1.changePasswordOTPVerificationController);
// update the password with the new password sent
userRouter.post("/reset-password", userController_1.changePasswordController);
userRouter.post("/registerPhone", checkUserAuth_1.checkUserAuthMiddelware, userController_1.registerUserPhoneController);
userRouter.post("/verifyPhone", checkUserAuth_1.checkUserAuthMiddelware, userController_1.verifyUserPhoneController);
/* User Routes */
userRouter.get("/:id", checkUserAuth_1.checkUserAuthMiddelware, userController_1.getSingleUserController);
userRouter.delete("/delete/:id", checkUserAuth_1.checkUserAuthMiddelware, userController_1.deleteUserController);
// create payment  pin
userRouter.post("/account/transferPinCreation", checkUserAuth_1.checkUserAuthMiddelware, userController_1.createTransferPinController);
// get ban details
userRouter.get("/account/details", checkUserAuth_1.checkUserAuthMiddelware, userController_1.getBankAccountDetailsController);
//verify bank transfer pic
userRouter.post("/account/tranferPinVerify", checkUserAuth_1.checkUserAuthMiddelware, userController_1.verifyBankTransferPinController);
// activete suspended account
userRouter.get("/account/suspended/activate/:id", userController_1.suspendedAccountActivation);
exports.default = userRouter;
/* getBankAccountDetails */ 
