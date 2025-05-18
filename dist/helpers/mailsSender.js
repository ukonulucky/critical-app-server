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
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
const sendBrevoEmail = function (req, res, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { subject, to, emailTemplate, mailData } = options;
        req.app.render(emailTemplate, mailData, (err, html) => __awaiter(this, void 0, void 0, function* () {
            if (err || !html) {
                console.error('Template render error:', err);
                throw new Error("Failed to render email template");
            }
            const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
            try {
                const data = {
                    sender: { email: 'fadoyint@gmail.com', name: mailData.companyName }, // { email: 'sender@example.com', name: 'Sender Name' }
                    to: to, // [{ email: 'recipient@example.com', name: 'Recipient Name' }]
                    subject: subject,
                    htmlContent: html,
                    headers: { "Homiee-User-Id": "unique-id-1234" },
                };
                const response = yield axios.post(BREVO_API_URL, data, {
                    headers: {
                        "api-key": process.env.BREVO_API_KEY,
                        "Content-Type": "application/json",
                    },
                });
                console.log("Email sent:", response === null || response === void 0 ? void 0 : response.data);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.log("mail error: ", error);
                    console.log("EMAIL ERR/BREVO::", error.message);
                }
                else {
                    console.error("An unknown error occurred");
                    console.error("Error sending email:");
                }
            }
        }));
    });
};
exports.default = sendBrevoEmail;
