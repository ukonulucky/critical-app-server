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
exports.TwilloPhoneOtpSender = void 0;
const twilio_1 = __importDefault(require("twilio"));
const TwilloPhoneOtpSender = (option) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const { OTP, receivingNumber, message } = option;
    const client = (0, twilio_1.default)(accountSid, authToken);
    try {
        /* make api call to twillio to send phone otp */
        const response = yield client.messages
            .create({
            body: `online bank assessment ${message} - ${OTP}`,
            to: receivingNumber, // Text your number
            from: process.env.TWILIO_OTP_SENDING_PHONE_NUMBER // From a valid Twilio number
        });
        if (!response) {
            throw new Error("Failed to send OTP to phone, please retry...");
        }
        if (response.errorMessage) {
            throw new Error(response.errorMessage);
        }
        return response;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Unknown Error");
    }
});
exports.TwilloPhoneOtpSender = TwilloPhoneOtpSender;
