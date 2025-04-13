import mongoose, {Error, Schema } from "mongoose"
import crypto from "crypto"
import { bankSchemaType } from "../appTypes/types";
import { encrypt } from "../helpers/encrypt";




const bankSchema = new mongoose.Schema<bankSchemaType>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
      
        transferPin: {
            type: Number,
            default: null
        },
        transferPinVerificationCode: {
            type: Number, 
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
        creditTransactions: [ {
            name:   String,
            amount: Number,
            date: Date
        }],
        depitTransaction: [ {
            name:   String,
            amount: Number,
            date: Date
        }],
        url: {
            type: String,
            default: null
        }
       
    },
  { timestamps: true }
);








// Hash the password before saving it to the database
bankSchema.pre<mongoose.Document & bankSchemaType>('save', async function (next) {
  if (this.isNew) {
    // update the url field only when the user is first created
      this.url = encrypt(this._id);
      next()
  }
  next();
});


bankSchema.methods.createTransferPinVerificationOTP = function (transferPin: number): number {
    console.log("ran now, pin:", transferPin)
      const phoneOTP = crypto.randomInt(10000, 100000); // 100000 is exclusive
    this.transferPinVerificationCode = phoneOTP
    this.transferPin = transferPin
    return phoneOTP
}


bankSchema.methods.isTransferPinVerificationOTPValid = function (OTP: number): boolean { 
    const result = this.transferPinVerificationCode === OTP

    if (result) {
        this.isTransferPinVerified = true
        return true
    } else { 
        return false
    }
}
const BankModel = mongoose.model("Bank", bankSchema);










export default BankModel
