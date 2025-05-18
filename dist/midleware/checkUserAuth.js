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
exports.checkUserAuthMiddelware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const checkUserAuthMiddelware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const userJwt = req.cookies?.token
    var _a;
    const userJwt = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Get the token from 'Bearer <token>'
    if (!userJwt) {
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
        return;
    }
    try {
        const { id } = jsonwebtoken_1.default.verify(userJwt, process.env.JWT_SECRET);
        const user = yield user_1.default.findById(id);
        if (!user) {
            res.status(401).json({ message: "User not found", isAuthenticated: false });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log("ran here 4");
        res.status(401).json({ message: "Invalid or expired token", isAuthenticated: false });
    }
});
exports.checkUserAuthMiddelware = checkUserAuthMiddelware;
