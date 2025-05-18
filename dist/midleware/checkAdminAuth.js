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
exports.checkAdminAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const checkAdminAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userJwt = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!userJwt) {
        /* 401 status code means not authorised */
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return;
    }
    try {
        const { id } = jsonwebtoken_1.default.verify(userJwt, process.env.JWT_SECRET);
        const user = yield user_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found", isAuthenticated: "false" });
            return;
        }
        const { role } = user;
        console.log("user found:", user);
        if (role !== "admin") {
            /* 403 status code means forbidden */
            res.status(403).json({ message: "Admin permission requred", isAuthenticated: "false" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return;
    }
});
exports.checkAdminAuthMiddleware = checkAdminAuthMiddleware;
