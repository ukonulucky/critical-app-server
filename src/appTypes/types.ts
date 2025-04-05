import { Document } from "mongoose"

export interface userSchemaInterface extends Document {
    fullName: string;
    password: string;
    phone: string,
    email: string;
    isPhoneVerified: Boolean;
    passwordResetExpires: Date | null;
    passwordResetToken: string | null;
    accountVerificationToken: String | null;
    isEmailVerified: Boolean;
    role: "user" | "admin";
    isDeleted: Boolean,
    failedLoginCount: Number; 
    deviceType: String;
    transferPin: String,
    isTransferPinVerified: String;
    createEmailVerificationToken: () => string; 
    comparePassword: (candidatePassword: string) => boolean;
    createPasswordResetCode: () => number;
    isPasswordResetTokenValid: (token: string) => boolean


    
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