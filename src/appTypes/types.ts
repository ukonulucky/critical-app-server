import { Document, Types } from "mongoose"
import { Request } from "express"

export interface userSchemaInterface extends Document {
    _id: string
    fullName: string;
    password: string;
    phone: string;
    email: string;
    url: string;
    isPhoneVerified: Boolean;
    passwordResetExpires: Date | null;
    passwordResetToken: string | null;
    accountVerificationToken: String | null;
    isEmailVerified: Boolean;
    role: "user" | "admin";
    isDeleted: Boolean,
    failedLoginCount: Number; 
    deviceType: String;
    transferPin: String;
    phoneVerificationCode: String;
    isTransferPinVerified: String;
    createEmailVerificationToken: () => string; 
    comparePassword: (candidatePassword: string) => boolean;
    createPasswordResetCode: () => number;
    isEmailVerificationTokenValid: (emailToken: string) => boolean;
    isPasswordResetTokenValid: (token: string) => boolean;
    createPhoneNumberVerificationOTP: (phoneNumber: string) => number

    isPhoneNumberVerificationOTPValid: (phoneToken: string) => {
        result: boolean,
        accountNumber?: number,
        accountName?: string,
        userId?:string
    };    
}
  

export interface mailSenderType { 
    subject: string
    to: {
        email: string,
        name: string
    }[]
    emailTemplate: string
    senderName: string
}


export interface registerType  {
    fullName: string;
    password: string;
    email: string;
    role?: string
}

export interface registerAccount { 
    phone: string,
    deviceType: string
}

// the cookies was added so as to retain the cookie property in the request 
export interface IGetUserAuthInfoRequest extends Request{
    params: { id: string}
    user?: userSchemaInterface;
   
    cookies: {
      token?: string;
      [key: string]: any;
    };

  }


export interface twillioOptionType { 
    OTP: number,
    receivingNumber: string
}


export interface bankSchemaType { 
    _id: string,
    userId: Types.ObjectId,
    balance: number,
    accountNumber: string,
    accountName: string,
    creditTransactions: string[]
    depitTransaction: {
        name: string,
        amount: number,
        date: Date
    }[],
    transferPin: number,
    isTransferPinVerified: {
        type: Boolean,
        default: false
    },
    url: string,
    transferPinVerificationCode: number | null,
    createTransferPinVerificationOTP: number | null,
    isTransferPinVerificationOTPValid: boolean


}