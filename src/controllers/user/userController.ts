import expressAsyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"

import isValidObjectId from "../../helpers/mongooseIdValidity";
import UserModel from "../../models/user";
import { IGetUserAuthInfoRequest, registerType } from "../../appTypes/types";
import sendBrevoEmail from "../../helpers/mailsSender";
import { TwilloPhoneOtpSender } from "../../helpers/sendPhoneOtp";


// register user controller
export const userRegisterController = expressAsyncHandler(async (req: Request<{}, {}, registerType>, res:Response ): Promise<void> => {
    const { 
        email,
        fullName,
        password,
        role
   } = req.body;

  // check if email and password are sent
  if (!email || !password || !fullName ) {
    throw new Error("Missing credentials");
  }

  // find if user already exist

  const foundUser = await UserModel.findOne({ email });

  if (foundUser) {
    throw new Error("User already exists");
  }

  const registeredUser = await UserModel.create({
    password,
    email,
    fullName,
      role
  });

  const { email: createdEmail } = registeredUser;
  /* endpoint to verify email */

  /* generate  token */
  const emailVerificationToken = registeredUser.createEmailVerificationToken();
  
  const verifyEmailEndpoint =
    process.env.SERVER_URL +
    "/api/v1/user" +
    "/emailVerify/" +
    createdEmail +
    "/" +
    emailVerificationToken;
  const message =
    "Please click here " + verifyEmailEndpoint + " to verify your email";
 console.log("email token created", emailVerificationToken)

  await registeredUser.save();
  /* send email for verification */

  const option = {
    subject: "Email Verification",
    emailTemplate:
      "Please click here " + verifyEmailEndpoint + " to verify your email",
    to: [
      {
        email: createdEmail,
        name: fullName,
      },
    ],
    senderName:"online bank assessment"
  };

  sendBrevoEmail(option);

 

   res.status(201).json({
    status: "success",
    message: "Account created, please verify your email",
    data: registeredUser,
    meta: message
  });
});



// login user
export const userLoginController = expressAsyncHandler(async (req: Request<{}, {}, {
  email: string,
  password: string
}>, res: Response): Promise<void> => {
/* find user  */
const { email, password } = req.body;
// check if email and password are sent
if (!email || !password) {
  throw new Error("Missing credentials");
}

const user = await UserModel.findOne({
  email
});

if (!user) {
  throw new Error("Invalid login credentials");
}
const isPasswordCorrect = await user.comparePassword(password);

  
 
if ( !isPasswordCorrect) {
  throw new Error("Invalid login credential");
}

const { isEmailVerified, accountVerificationToken, fullName } = user;
  if (!isEmailVerified) {
  
    /* send email to verify user email */
  const verifyEmailEndpoint =
    process.env.SERVER_URL +
    "/api/v1/user" +
    "/emailVerify/" +
    email +
    "/" +
    accountVerificationToken;

  /*    sendBrevoEmail(option2) */
  const option = {
    subject: "Email Verification",
    emailTemplate:
      "Please click here " + verifyEmailEndpoint + " to verify your email",
    to: [
      {
        email: email,
        name: fullName,
      },
    ],
    senderName:"online bank assessment"
  };

    sendBrevoEmail(option);
    res.status(200).json({
      status: "false",
      message: "Failed to login, email not verified, please check your mail to verify your email",
      user,
    });
    return
}
const { _id } = user;
// set jwt token for the user
const token = jwt.sign({ id: _id }, process.env.JWT_SECRET as string);

// set cookie

res.cookie("token", token, {
  maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
  httpOnly: true,
  sameSite: "strict",
  secure: false,
});

 res.status(200).json({
  status: "success",
  message: "Login successful",
  user,
});
});


/* verify user email */

export const verifyEmailController = expressAsyncHandler(async (req: Request<{
    email: string,
    token: string
}>, res): Promise<void> => {
  const { email, token } = req.params;


  if (!token || !email) {
    throw new Error("Missing credentials");
  }


  
  const foundUser = await UserModel.findOne({
    email
  });
  if (!foundUser) {
     res.status(401).json({
      status: false,
      message: "user not found",
     });
      return
  }

  const isTokenValid = foundUser.isEmailVerificationTokenValid(token)
  if (!isTokenValid) { 
  throw new Error("Invalid user token")
  }
  foundUser.isEmailVerified = true;
  foundUser.accountVerificationToken = null;
  await foundUser.save();
  const url = process.env.CLIENT_URL + "/emailVerified";
  res.redirect(url);
});



export const logOutUserController = expressAsyncHandler(async (req, res): Promise<void> => {
  res.cookie("token", "", {
    maxAge: 1,
  });
  res.status(200).json({
    status: "success",
    message: "user logged out",
  });
});

/* forgot password */

export const forgotPasswordController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    throw new Error("Missing credentials");
  }

  const foundUser = await UserModel.findOne({
    email,
  });
  if (!foundUser) {
res.status(401).json({
      status: false,
      message: "user not found",
});
      return 
  }

  /* generate 5 digit code */

  const code = foundUser.createPasswordResetCode();
  const { email: userEmail, fullName } = foundUser;

  await foundUser.save();
  const message =
    "Please use this OTP " +
    code +
    " to change your password. OTP expires in one hour";

  const option = {
    subject: "Forgot Password",
    emailTemplate: message,
    to: [
      {
        email: userEmail,
        name: fullName,
      },
    ],
    senderName:"online bank assessment"
  };

  sendBrevoEmail(option);
  /*  mailSender() */
  res.status(200).json({
    error: false,
    message: "Hi, a change password OTP has been sent to your mail",
    meta: message,
  });
});

export const changePasswordOTPVerificationController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    throw new Error("Missing credentials");
  }

  const foundUser = await UserModel.findOne({
    email
  });
  if (!foundUser) {
 res.status(401).json({
      status: false,
      message: "user not found",
 });
      return 
  }

  /* generate 5 digit code */

  const isTokenValid = foundUser.isPasswordResetTokenValid(token);

  if (!isTokenValid) {
    throw new Error("Incorrect or expired OTP");
  }

  const { email: emailSaved, fullName } = foundUser;
  foundUser.password = password;
  foundUser.passwordResetExpires = null;
  foundUser.passwordResetToken = null;

  await foundUser.save();

  const option = {
    subject: "Password Updated",
    emailTemplate: "Your password has been updated successfully",
    to: [
      {
        email: emailSaved,
        name: fullName,
      },
    ],
    senderName:"online bank assessment"
  };

  sendBrevoEmail(option);

  res.status(200).json({
    error: false,
    status: true,
    message: "Password updated successfully",
    user: foundUser
  });
});



export const registerUserPhoneController = expressAsyncHandler(async (req:IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  const { id } = req.params
  const { phone } = req.body


  if (!phone) { 
     throw new Error("Missing crredentials")
  }

  const user = await UserModel.findById(id)

  if (!user) { 
    res.status(404).json({
      status: "false",
      message: "User not found"
    })
    return
  }


  const otp = user.createPhoneNumberVerificationOTP(phone)

  user.save()
  if (!otp) throw new Error("Failed to generate phone number verification token")
  // send OTP to phone number
  console.log("otp sent", otp)
  
 const response = await TwilloPhoneOtpSender({
    OTP: otp,
    receivingNumber: phone
  })

  res.status(200).json({
    status: "true",
    message: "Verification OTP sent to your phone, please verify"
  })
  return 
 
});


export const verifyUserPhoneController = expressAsyncHandler(async (req:IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  const { id } = req.params
  const { OTP } = req.body


  if (!id || !OTP) { 
     throw new Error("Missing crredentials")
  }

  const user = await UserModel.findById(id)

  if (!user) { 
    res.status(404).json({
      status: "false",
      message: "User not found"
    })
    return
  }


  const isOtpCorrect = user.isPhoneNumberVerificationOTPValid(OTP)

 await user.save()
  if (!isOtpCorrect) { 
    res.status(400).json({
      status: "false",
      message: "Incorrect or Invalid Otp... please retry"
    }
      
    )
    return 
  }

  res.status(200).json({
    status: "true",
    message: "Phone number successfully verified"
  })


  
 
});


export const getSingleUserController = expressAsyncHandler(async (req, res): Promise<void> => {
  
  const { id } = req.params;
  const isIdVallid = isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  const userFound = await UserModel.findById(id);
  if (!userFound) {
     res.status(404).json({
      status: "failed",
      message: "User not found",
     });
      return
  }

res.status(200).json({
  status: "success",
  mesage: "User fetched successfuly",
    user: userFound,
  });
});


export const deleteUserController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  
  const user = req.user
  const { id } = req.params;
  console.log("user passed", user)
  if ( user && user._id.toString() !== id) { 
    res.status(403).json({
      message: "Admine role only",
      status: "false"
    })
    return
}
  // check if id is sent
  if (!id) {
    throw new Error("Missing user Id");
  }

  // delete user

  const deletedUser = await UserModel.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new Error("Failed to delete user");
  }

   res.status(201).json({
    status: "success",
    message: "User deleted successfully",
    data: deletedUser,
  });
});