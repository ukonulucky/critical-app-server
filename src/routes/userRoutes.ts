import { changePasswordController, deleteUserController, forgotPasswordController, getAllUsersController, getSingleUserController, logOutUserController, userLoginController, userRegisterController, verifyEmailController } from "../controllers/user/userController";
import { checkAdminAuthMiddleware } from "../midleware/checkAdminAuth";
import { checkUserAuthMiddelware } from "../midleware/checkUserAuth";



const express = require('express');

const userRouter = express.Router();

/* Auth Routes */
userRouter.post("/register", userRegisterController)
userRouter.post("/login", userLoginController)
userRouter.post("/forgotPassword", forgotPasswordController)
userRouter.post("/logout", checkUserAuthMiddelware,logOutUserController)

userRouter.get("/emailVerify/:email/:token", verifyEmailController)



/* User Routes */
userRouter.get("/allUsers", checkAdminAuthMiddleware, getAllUsersController)

userRouter.get("/:id", checkUserAuthMiddelware, getSingleUserController)

userRouter.post("/changePassword", changePasswordController)

userRouter.get("/delete",checkUserAuthMiddelware,deleteUserController )


userRouter.get("/deleteAll",checkAdminAuthMiddleware )
export default userRouter
