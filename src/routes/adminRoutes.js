import { changePasswordController, deleteUserController, forgotPasswordController, getAllUsersController, getSingleUserController, logOutUserController, userLoginController, userRegisterController, verifyEmailController } from "../controllers/user/userController";
import { checkAdminAuthMiddleware } from "../midleware/checkAdminAuth";
import { checkUserAuthMiddelware } from "../midleware/checkUserAuth";



const express = require('express');

const adminRouter = express.Router();


/* Admin routes */
// get all users
adminRouter.get("/allUsers", checkAdminAuthMiddleware, getAllUsersController)

// get all users
adminRouter.get("/deleteAll",checkAdminAuthMiddleware )
export default userRouter

// get single user admin
