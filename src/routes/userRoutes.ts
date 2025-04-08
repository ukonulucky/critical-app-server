import {  changePasswordOTPVerificationController, deleteUserController, forgotPasswordController, getSingleUserController, logOutUserController, registerUserPhoneController, userLoginController, userRegisterController, verifyEmailController, verifyUserPhoneController } from "../controllers/user/userController";
import { checkAdminAuthMiddleware } from "../midleware/checkAdminAuth";
import { checkUserAuthMiddelware } from "../midleware/checkUserAuth";



const express = require('express');

const userRouter = express.Router();

/* Auth Routes */
userRouter.post("/register", userRegisterController)

userRouter.post("/login", userLoginController)


userRouter.get("/logout", checkUserAuthMiddelware, logOutUserController)


userRouter.get("/emailVerify/:email/:token", verifyEmailController)

userRouter.post("/forgotPassword", forgotPasswordController)

userRouter.post("/changePassword/OTPveirfy", changePasswordOTPVerificationController)

userRouter.post("/registerPhone/:id", registerUserPhoneController)

userRouter.post("/verifyPhone/:id", verifyUserPhoneController)




/* User Routes */


userRouter.get("/:id", checkUserAuthMiddelware, getSingleUserController)



userRouter.delete("/delete/:id",checkUserAuthMiddelware,deleteUserController )


export default userRouter
