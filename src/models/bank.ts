import mongoose, {Error } from "mongoose"

import { bankSchemaType } from "../appTypes/types";




const userSchema = new mongoose.Schema<bankSchemaType>(
    {
      
        transferPin: {
            type: String,
            default: null
        },
        isTransferPinVerified: {
            type: Boolean,
            default: false
        },
        accountName: {
            type: String,
            required: true,

        },
        accountNumber: {
            type: String,
            required: true
        },
        balance: {
            type: Number,
            default: 0
        },
       
    },
  { timestamps: true }
);





const UserModel = mongoose.model("User", userSchema);

export default UserModel
