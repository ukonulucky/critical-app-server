"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminController_1 = require("../controllers/admin/adminController");
const checkAdminAuth_1 = require("../midleware/checkAdminAuth");
const express = require('express');
const adminRouter = express.Router();
/* Admin routes */
// get sigle user
adminRouter.get("/user/:id", checkAdminAuth_1.checkAdminAuthMiddleware, adminController_1.getSingleUserAdminController);
// get all users 
adminRouter.get("/allUsers", checkAdminAuth_1.checkAdminAuthMiddleware, adminController_1.getAllUsersAdminController);
// delete all users
adminRouter.get("/deleteAll", checkAdminAuth_1.checkAdminAuthMiddleware, adminController_1.deleteAllUserAdminController);
// delete single user 
adminRouter.get("/delete/:id", checkAdminAuth_1.checkAdminAuthMiddleware, adminController_1.deleteUserAdminController);
// get all accounts
adminRouter.get("/accounts", checkAdminAuth_1.checkAdminAuthMiddleware, adminController_1.getAllAccounController);
exports.default = adminRouter;
// get single user admin
