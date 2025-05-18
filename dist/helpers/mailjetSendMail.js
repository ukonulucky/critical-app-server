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
// mailer.js
const mailjet = require('node-mailjet');
const mailjetClient = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
// Load and compile Handlebars template
// Send email
const sendMailjetEmail = (req, res, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, to, emailTemplate, mailData } = options;
    req.app.render(emailTemplate, mailData, (err, html) => __awaiter(void 0, void 0, void 0, function* () {
        if (err || !html) {
            console.error('Template render error:', err);
            throw new Error("Failed to render email template");
        }
        try {
            const request = yield mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'ukonulucky@gmail.com',
                            Name: 'SmartTek Bank',
                        },
                        To: [
                            {
                                Email: to[0].email,
                                Name: to[0].name,
                            },
                        ],
                        Subject: subject,
                        HTMLPart: html,
                    },
                ],
            });
            console.log('Email sent successfully from mailjet:', request.body);
        }
        catch (err) {
            console.error('Email sending failed:', err);
        }
    }));
});
exports.default = sendMailjetEmail;
