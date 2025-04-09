import mongoose, {Error } from "mongoose"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { userSchemaInterface } from "../appTypes/types";
import { encrypt } from "../helpers/encrypt";
import { decrypt } from "../helpers/decrypt";




const userSchema = new mongoose.Schema<userSchemaInterface>(
  {
        fullName: {
            type: String, required: true, trim: true
        },
    email: { type: String, required: true,  unique: true, trim: true },
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
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"]
    },
    isDeleted:{
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
    }

  },

  { timestamps: true }
);


// Hash the password before saving it to the database
userSchema.pre<mongoose.Document & userSchemaInterface>('save', async function (next) {
  if (this.isNew) {
    // update the url field only when the user is first created
    this.url = encrypt(this._id);
   
  }
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
     throw new Error(error)
  }
});


// Method to compare the provided password with the stored hash
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {

  const result = await bcrypt.compare(candidatePassword, this.password);
  return result
};



// Method to generate a password reset token
userSchema.methods.createPasswordResetCode = function (): number{
  // Generate a random number between 10000 and 99999
  const code = crypto.randomInt(10000, 100000); // 100000 is exclusive

    // Set token to be valid for 1 hour
    this.passwordResetToken = code;
    this.passwordResetExpires = Date.now() + 3600000; // 1 hour from now
  
  return code;

};

// Method to check if the reset token is valid (not expired)
userSchema.methods.isPasswordResetTokenValid = function (token: string): boolean {
  return (
    this.passwordResetToken === token && this.passwordResetExpires > Date.now()
  );
};

// Method to generate account verification token
userSchema.methods.createEmailVerificationToken = function (): String {
  const emailToken = crypto.randomBytes(20).toString('hex');

  // Set account verifcation token
  this.accountVerificationToken = emailToken;


  return emailToken;
};


// Method to check if the email Verification token is valid 
userSchema.methods.isEmailVerificationTokenValid = function (emailToken: string): boolean {
  return this.accountVerificationToken === emailToken
  
};


/* static methods for creating and verifying phone number token */

// creating and set the token
userSchema.methods.createPhoneNumberVerificationOTP = function (phoneNumber: string): number {
 
    // Generate a random number between 10000 and 99999
    const phoneOTP = crypto.randomInt(10000, 100000); // 100000 is exclusive

  // Set account verifcation token
  this.phone= phoneNumber;
  this.phoneVerificationCode = phoneOTP

  return phoneOTP;
};

// verify the phoneToken token
userSchema.methods.isPhoneNumberVerificationOTPValid = function (phoneToken: string): {
  result: boolean,
  accountNumber?: number,
  accountName?: string,
  userId?:string
}{
  if (this.phoneVerificationCode === phoneToken) {
    this.isPhoneVerified = true
    this.phoneVerificationCode = null
    return {
      result: true,
      accountNumber: this.phone.slice(1),
      accountName: this.fullName,
      userId: this._id
    }
  } else { 
    return {
      result : false
    }
  }
  
};




const UserModel = mongoose.model("User", userSchema);

export default UserModel
