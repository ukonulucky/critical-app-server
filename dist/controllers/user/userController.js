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
exports.suspendedAccountActivation = exports.verifyBankTransferPinController = exports.createTransferPinController = exports.getBankAccountDetailsController = exports.deleteUserController = exports.getSingleUserController = exports.verifyUserPhoneController = exports.registerUserPhoneController = exports.changePasswordController = exports.changePasswordOTPVerificationController = exports.forgotPasswordController = exports.logOutUserController = exports.verifyEmailController = exports.userLoginController = exports.userRegisterController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongooseIdValidity_1 = __importDefault(require("../../helpers/mongooseIdValidity"));
const user_1 = __importDefault(require("../../models/user"));
const sendPhoneOtp_1 = require("../../helpers/sendPhoneOtp");
const bank_1 = __importDefault(require("../../models/bank"));
const decrypt_1 = require("../../helpers/decrypt");
const encrypt_1 = require("../../helpers/encrypt");
const mailjetSendMail_1 = __importDefault(require("../../helpers/mailjetSendMail"));
// register user controller
exports.userRegisterController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, fullName, password, phone, role } = req.body;
    // check if email and password are sent
    if (!email || !password || !fullName || !phone) {
        throw new Error("Missing credentials");
    }
    // find if user already exist
    const foundUser = yield user_1.default.findOne({ email });
    if (foundUser) {
        throw new Error("User already exists");
    }
    const registeredUser = yield user_1.default.create({
        password,
        email,
        phone,
        fullName,
        role
    });
    const { email: createdEmail } = registeredUser;
    /* endpoint to verify email */
    /* generate  token */
    const emailVerificationToken = registeredUser.createEmailVerificationToken();
    const verifyEmailEndpoint = process.env.SERVER_URL +
        "/api/v1/user" +
        "/emailVerify/" +
        createdEmail +
        "/" +
        emailVerificationToken;
    yield registeredUser.save();
    /* send email for verification */
    const option = {
        subject: "Activate Your Account!",
        emailTemplate: "accountVerification",
        to: [
            {
                email: createdEmail,
                name: fullName,
            },
        ],
        mailData: {
            companyName: "online bank assessment",
            userName: fullName,
            link: verifyEmailEndpoint
        }
    };
    yield (0, mailjetSendMail_1.default)(req, res, option);
    res.status(201).json({
        status: "success",
        message: "Account created, please verify your email",
        data: registeredUser,
    });
}));
// login user
exports.userLoginController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /* find user  */
    const { email, password } = req.body;
    // check if email and password are sent
    if (!email || !password) {
        throw new Error("Missing credentials");
    }
    const user = yield user_1.default.findOne({
        email
    });
    if (!user) {
        throw new Error("Invalid login credentials");
    }
    const isPasswordCorrect = yield user.comparePassword(password);
    const encryptedId = (0, encrypt_1.encrypt)(user._id);
    if (!isPasswordCorrect) {
        if (user.failedLoginCount === 2) {
            yield user_1.default.findOneAndUpdate({ email }, { status: "suspended" }, { new: true } // returns the updated document
            );
            yield (0, mailjetSendMail_1.default)(req, res, {
                subject: "Failed Loging Attempt",
                to: [
                    {
                        email,
                        name: user.fullName
                    }
                ],
                emailTemplate: "failedLoginTemplate",
                mailData: {
                    companyName: "Online bank assessment",
                    userName: user.fullName,
                    link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
                    verificationCode: undefined
                }
            });
            throw new Error("Account suspended, please check your mail to activate account.");
        }
        yield user_1.default.findOneAndUpdate({ email }, {
            $inc: {
                failedLoginCount: 1
            }
        }, { new: true } // returns the updated document
        );
        throw new Error("Invalid login credential");
    }
    const { isEmailVerified } = user;
    if (!isEmailVerified) {
        /* generate  token */
        const emailVerificationToken = user.createEmailVerificationToken();
        yield user.save();
        const verifyEmailEndpoint = process.env.SERVER_URL +
            "/api/v1/user" +
            "/emailVerify/" +
            user.email +
            "/" +
            emailVerificationToken;
        /* send email for verification */
        const option = {
            subject: "Activate Your Account!",
            emailTemplate: "accountVerification",
            to: [
                {
                    email: user.email,
                    name: user.fullName,
                },
            ],
            mailData: {
                companyName: "online bank assessment",
                userName: user.fullName,
                link: verifyEmailEndpoint
            }
        };
        yield (0, mailjetSendMail_1.default)(req, res, option);
        throw new Error("Email not verified, please check your mail to verify email");
    }
    // check if user is suspended
    if (user.status === "suspended") {
        console.log("code ran here");
        yield (0, mailjetSendMail_1.default)(req, res, {
            subject: "Failed Loging Attempt",
            to: [
                {
                    email,
                    name: user.fullName
                }
            ],
            emailTemplate: "failedLoginTemplate",
            mailData: {
                companyName: "Online bank assessment",
                userName: user.fullName,
                link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
                verificationCode: undefined
            }
        });
        /* await sendBrevoEmail(req, res, {
          subject: "Failed Loging Attempt",
          to: [
            {
              email,
               name: user.fullName
            }
          ],
          emailTemplate: "failedLoginTemplate",
          mailData: {
            companyName: "Online bank assessment",
            userName: user.fullName,
            link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
             verificationCode: undefined
          }
      
        }) */
        throw new Error("Account suspended, please check your mail to activate account.");
    }
    const { _id } = user;
    // set jwt token for the user
    const token = jsonwebtoken_1.default.sign({ id: _id }, process.env.JWT_SECRET);
    // get user bank details if account is verified
    const bankData = yield bank_1.default.findOne({
        userId: _id
    });
    // set cookie
    res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
        httpOnly: true,
        sameSite: "strict",
        secure: false,
    });
    res.status(200).json({
        error: false,
        status: "success",
        message: "Login successful",
        user,
        bankData: bankData && bankData.accountNumber ? bankData : null,
        token
    });
}));
/* verify user email */
exports.verifyEmailController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.params;
    if (!token || !email) {
        throw new Error("Missing credentials");
    }
    const foundUser = yield user_1.default.findOne({
        email
    });
    if (!foundUser) {
        res.status(401).json({
            status: false,
            message: "user not found",
        });
        return;
    }
    const isTokenValid = foundUser.isEmailVerificationTokenValid(token);
    if (!isTokenValid) {
        throw new Error("Invalid user token");
    }
    foundUser.isEmailVerified = true;
    foundUser.accountVerificationToken = null;
    foundUser.status = "approved";
    yield foundUser.save();
    /* const url = process.env.CLIENT_URL + "/emailVerified"; */
    res.render("emailVerification");
}));
exports.logOutUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", {
        maxAge: 1,
    });
    res.status(200).json({
        status: "success",
        message: "user logged out",
    });
}));
/* controller to generate an OTP to be sent to the users email for passsword update */
exports.forgotPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new Error("Missing credentials");
    }
    const foundUser = yield user_1.default.findOne({
        email,
    });
    if (!foundUser) {
        res.status(401).json({
            status: false,
            message: "user not found",
        });
        return;
    }
    /* generate 5 digit code */
    const code = foundUser.createPasswordResetCode();
    const { email: userEmail, fullName } = foundUser;
    yield foundUser.save();
    const option = {
        subject: "Forgot Password",
        emailTemplate: "forgotPasswordTemplate",
        to: [
            {
                email: userEmail,
                name: fullName,
            },
        ],
        mailData: {
            companyName: "online bank assessment",
            userName: fullName,
            link: "",
            verificationCode: code
        }
    };
    yield (0, mailjetSendMail_1.default)(req, res, option);
    /*  mailSender() */
    res.status(200).json({
        error: false,
        status: "success",
        message: "Hi, a change password OTP has been sent to your mail",
        data: {
            userEmail
        }
    });
}));
// controller to verify the otp sent to the users email for password change
exports.changePasswordOTPVerificationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.body;
    if (!email || !token) {
        throw new Error("Missing credentials");
    }
    const foundUser = yield user_1.default.findOne({
        email
    });
    if (!foundUser) {
        res.status(401).json({
            error: false,
            status: false,
            message: "user not found",
        });
        return;
    }
    /* check if token is valid */
    const isTokenValid = foundUser.isPasswordResetTokenValid(token);
    if (!isTokenValid) {
        throw new Error("Incorrect or expired OTP");
    }
    foundUser.passwordResetExpires = null;
    foundUser.passwordResetToken = null;
    foundUser.isPasswordForgetOtpVerified = true;
    yield foundUser.save();
    res.status(200).json({
        error: false,
        status: "success",
        message: "OTP verified successfully",
        data: {
            email: foundUser.email
        }
    });
}));
// controller to change the users password to the new password
exports.changePasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new Error("Missing credentials");
    }
    const foundUser = yield user_1.default.findOne({
        email
    });
    if (!foundUser) {
        res.status(401).json({
            status: false,
            message: "user not found",
        });
        return;
    }
    /*  check if the otp sent to the user has been verified */
    if (!foundUser.isPasswordForgetOtpVerified) {
        throw new Error("Password reset OTP not verified");
    }
    //  set all fields to its default state after changing the password
    const { email: emailSaved, fullName } = foundUser;
    foundUser.password = password;
    foundUser.isPasswordForgetOtpVerified = false;
    yield foundUser.save();
    const option = {
        subject: "Password Update Success",
        emailTemplate: "passwordUpdateSuccessTemplate",
        to: [
            {
                email: emailSaved,
                name: fullName,
            },
        ],
        mailData: {
            companyName: "online bank assessment",
            userName: fullName,
            link: "https://ukonuluckyportfolio.vercel.app/",
        }
    };
    (0, mailjetSendMail_1.default)(req, res, option);
    /* sendBrevoEmail(option); */
    res.status(200).json({
        error: false,
        status: true,
        message: "Password updated successfully",
    });
}));
exports.registerUserPhoneController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { phone } = req.body;
    const isIdVallid = id && (0, mongooseIdValidity_1.default)(id.toString());
    if (!id || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    if (!phone) {
        throw new Error("Missing credentials");
    }
    const user = yield user_1.default.findById(id);
    if (!user) {
        res.status(404).json({
            status: "false",
            message: "User not found"
        });
        return;
    }
    const otp = user.createPhoneNumberVerificationOTP(phone);
    user.save();
    if (!otp)
        throw new Error("Failed to generate phone number verification token");
    // send OTP to phone number
    console.log("otp sent", otp);
    yield (0, sendPhoneOtp_1.TwilloPhoneOtpSender)({
        OTP: otp,
        receivingNumber: phone,
        message: "phone verifcation code"
    });
    res.status(200).json({
        status: "true",
        message: "Verification OTP sent to your phone, please verify"
    });
    return;
}));
exports.verifyUserPhoneController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { OTP } = req.body;
    if (!id || !OTP) {
        throw new Error("Missing crredentials");
    }
    const isIdVallid = (0, mongooseIdValidity_1.default)(id.toString());
    if (!id || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    const user = yield user_1.default.findById(id);
    if (!user) {
        res.status(404).json({
            status: "false",
            message: "User not found"
        });
        return;
    }
    const { result, accountNumber, accountName, userId } = user.isPhoneNumberVerificationOTPValid(OTP);
    yield user.save();
    if (!result) {
        res.status(400).json({
            status: "false",
            message: "Incorrect or Invalid Otp. Please retry"
        });
        return;
    }
    const accountSave = yield bank_1.default.create({
        accountNumber,
        accountName,
        userId
    });
    if (!accountSave) {
        throw new Error("Error occured in account creation, please retry phonenumber verification");
    }
    res.status(200).json({
        status: "success",
        message: "Phone number successfully verified and account created successfuly"
    });
}));
exports.getSingleUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const decryptedId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(decryptedId.toString());
    if (!id || !isIdVallid) {
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
exports.deleteUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    const decryptedId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(decryptedId.toString());
    if (!id || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    if (user && user._id.toString() !== decryptedId.toString()) {
        res.status(403).json({
            message: "Admine role only",
            status: "false"
        });
        return;
    }
    // check if id is sent
    if (!id) {
        throw new Error("Missing user Id");
    }
    // delete user
    const deletedUser = yield user_1.default.findByIdAndDelete(decryptedId);
    if (!deletedUser) {
        throw new Error("Failed to delete user");
    }
    res.status(201).json({
        status: "success",
        message: "User deleted successfully",
        data: deletedUser,
    });
}));
exports.getBankAccountDetailsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const getAccount = yield bank_1.default.findOne({
        userId: id === null || id === void 0 ? void 0 : id.toString()
    }).populate("userId").exec();
    if (!getAccount) {
        throw new Error("No account found");
    }
    res.status(200).json({
        status: "true",
        message: "Account successfully fetched",
        data: getAccount
    });
}));
exports.createTransferPinController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { transferPin } = req.body;
    if (!transferPin) {
        throw new Error("Missing crredentials");
    }
    const getAccount = yield bank_1.default.findOne({
        userId: id === null || id === void 0 ? void 0 : id.toString()
    }).populate("userId").exec();
    if (!getAccount) {
        res.status(404).json({
            status: "false",
            message: "Account not found"
        });
        return;
    }
    // generate OTP
    const getOtp = getAccount.createTransferPinVerificationOTP(transferPin);
    // send otp to user phone
    const phone = (_b = getAccount === null || getAccount === void 0 ? void 0 : getAccount.userId) === null || _b === void 0 ? void 0 : _b.phone;
    yield getAccount.save();
    yield (0, sendPhoneOtp_1.TwilloPhoneOtpSender)({
        OTP: getOtp,
        receivingNumber: phone,
        message: "create transfer pin OTP"
    });
    res.status(200).json({
        status: "success",
        message: "Phone verification OTP sent, please verify",
        data: getAccount
    });
}));
exports.verifyBankTransferPinController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { OTP } = req.body;
    if (!id || !OTP) {
        throw new Error("Missing crredentials");
    }
    const isIdVallid = (0, mongooseIdValidity_1.default)(id.toString());
    if (!id || !isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    const account = yield bank_1.default.findOne({
        userId: id
    });
    if (!account) {
        res.status(404).json({
            status: "false",
            message: "Account not found"
        });
        return;
    }
    const result = account.isTransferPinVerificationOTPValid(OTP);
    yield account.save();
    if (!result) {
        throw new Error("Account verifcation pin expired or invalid. Please retry");
    }
    res.status(200).json({
        status: "success",
        message: "Transfer pin created successfuly"
    });
}));
exports.suspendedAccountActivation = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id)
        throw new Error("Missing credentials");
    const userId = (0, decrypt_1.decrypt)(id);
    const isIdVallid = (0, mongooseIdValidity_1.default)(userId.toString()); // check if userId is a valid mongoose id
    if (!isIdVallid) {
        res.status(404).json({
            status: "failed",
            message: "Invaild id or id not found",
        });
        return;
    }
    const user = yield user_1.default.findByIdAndUpdate(userId, {
        failedLoginCount: 0,
        status: "approved"
    }, {
        new: true
    });
    if (!user)
        throw new Error("user does not exist");
    res.render("suspendedAccountActivation", {
        userName: user.fullName,
        companyName: "Online bank assessment",
        loginUrl: `${process.env.SERVER_URL}/api/v1/user/login`
    });
    // send user an otp to verifiy user
}));
