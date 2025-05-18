"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const encrypt_1 = require("../helpers/encrypt");
const userSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String, required: true, trim: true
    },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: {
        type: String, default: null
    },
    phoneVerificationCode: {
        type: String,
        default: null
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    passwordResetExpires: {
        type: Date, default: null
    },
    passwordResetToken: {
        type: String, default: null
    },
    accountVerificationToken: {
        type: String, default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPasswordForgetOtpVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    failedLoginCount: {
        type: Number,
        default: 0
    },
    deviceType: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: "pending"
    }
}, { timestamps: true });
// Hash the password before saving it to the database
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            // update the url field only when the user is first created
            this.url = (0, encrypt_1.encrypt)(this._id);
        }
        if (!this.isModified('password'))
            return next();
        try {
            // Generate a salt and hash the password
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            throw new mongoose_1.Error(error);
        }
    });
});
// Method to compare the provided password with the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield bcryptjs_1.default.compare(candidatePassword, this.password);
        return result;
    });
};
// Method to generate a password reset token
userSchema.methods.createPasswordResetCode = function () {
    // Generate a random number between 10000 and 99999
    const code = crypto_1.default.randomInt(10000, 100000); // 100000 is exclusive
    // Set token to be valid for 1 hour
    this.passwordResetToken = code;
    this.passwordResetExpires = Date.now() + 3600000; // 1 hour from now
    return code;
};
// Method to check if the reset token is valid (not expired)
userSchema.methods.isPasswordResetTokenValid = function (token) {
    return (this.passwordResetToken === token && this.passwordResetExpires > Date.now());
};
// Method to generate account verification token
userSchema.methods.createEmailVerificationToken = function () {
    const emailToken = crypto_1.default.randomBytes(20).toString('hex');
    // Set account verifcation token
    this.accountVerificationToken = emailToken;
    return emailToken;
};
// Method to check if the email Verification token is valid 
userSchema.methods.isEmailVerificationTokenValid = function (emailToken) {
    return this.accountVerificationToken === emailToken;
};
/* static methods for creating and verifying phone number token */
// creating and set the token
userSchema.methods.createPhoneNumberVerificationOTP = function (phoneNumber) {
    // Generate a random number between 10000 and 99999
    const phoneOTP = crypto_1.default.randomInt(10000, 100000); // 100000 is exclusive
    // Set account verifcation token
    this.phone = phoneNumber;
    this.phoneVerificationCode = phoneOTP;
    return phoneOTP;
};
// verify the phoneToken token
userSchema.methods.isPhoneNumberVerificationOTPValid = function (phoneToken) {
    if (this.phoneVerificationCode === phoneToken) {
        this.isPhoneVerified = true;
        this.phoneVerificationCode = null;
        return {
            result: true,
            accountNumber: this.phone.slice(1),
            accountName: this.fullName,
            userId: this._id
        };
    }
    else {
        return {
            result: false
        };
    }
};
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
