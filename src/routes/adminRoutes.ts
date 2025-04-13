import {  deleteAllUserAdminController, deleteUserAdminController, getAllAccounController, getAllUsersAdminController, getSingleUserAdminController } from "../controllers/admin/adminController";

import { checkAdminAuthMiddleware } from "../midleware/checkAdminAuth";




const express = require('express');

const adminRouter = express.Router();


/* Admin routes */

// get sigle user
adminRouter.get("/user/:id", checkAdminAuthMiddleware, getSingleUserAdminController) 


// get all users 

adminRouter.get("/allUsers", checkAdminAuthMiddleware, getAllUsersAdminController)

// delete all users
adminRouter.get("/deleteAll", checkAdminAuthMiddleware,deleteAllUserAdminController)

// delete single user 
adminRouter.get("/delete/:id", checkAdminAuthMiddleware, deleteUserAdminController)


// get all accounts

adminRouter.get("/accounts", checkAdminAuthMiddleware, getAllAccounController)






export default adminRouter

// get single user admin
