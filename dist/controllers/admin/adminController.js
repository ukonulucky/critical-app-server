"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleAccountAdminController = exports.getAllAccounController = exports.deleteAllUserAdminController = exports.deleteUserAdminController = exports.getSingleUserAdminController = exports.getAllUsersAdminController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const decrypt_1 = require("../../helpers/decrypt");
const mongooseIdValidity_1 = __importDefault(require("../../helpers/mongooseIdValidity"));
const user_1 = __importDefault(require("../../models/user"));
const bank_1 = __importDefault(require("../../models/bank"));
exports.getAllUsersAdminController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.find();
        res.status(201).json({
            status: "success",
            message: "Users fetched successfuly",
            users
        });
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        else {
            throw new Error("Internal server error");
        }
    }
}));
exports.getSingleUserAdminController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const decryptedId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(decryptedId.toString());
    if (!decryptedId || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    const userFound = yield user_1.default.findById(decryptedId);
    if (!userFound) {
        res.status(404).json({
            status: "failed",
            message: "User not found",
        });
        return;
    }
    res.status(200).json({
        status: "success",
        mesage: "User fetched successfuly",
        user: userFound,
    });
}));
exports.deleteUserAdminController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    const decryptedId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(decryptedId.toString());
    if (!decryptedId || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    // check if id is sent
    // delete user
    const deletedUser = yield user_1.default.findByIdAndDelete(id);
    if (!deletedUser) {
        throw new Error("Failed to delete user");
    }
    res.status(201).json({
        status: "success",
        message: "User deleted successfully",
        data: deletedUser,
    });
}));
exports.deleteAllUserAdminController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteAll = yield user_1.default.deleteMany({});
    res.status(201).json({
        status: "success",
        message: "All users deleted successfully",
        data: deleteAll,
    });
}));
// bank controllers
exports.getAllAccounController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get all accounts
    const accounts = yield bank_1.default.find({}).populate("userId").exec();
    res.status(200).json({
        status: "success",
        message: "Account fetched successfully",
        accounts
    });
}));
exports.getSingleAccountAdminController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const decryptedId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(decryptedId.toString());
    if (!decryptedId || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    const accountFound = yield bank_1.default.findById(decryptedId);
    if (!accountFound) {
        res.status(404).json({
            status: "failed",
            message: "Account not found",
        });
        return;
    }
    res.status(200).json({
        status: "success",
        mesage: "Account fetched successfuly",
        user: accountFound,
    });
}));
