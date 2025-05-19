import expressAsyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import {  Request, Response } from "express"


import isValidObjectId from "../../helpers/mongooseIdValidity";
import UserModel from "../../models/user";
import { IGetUserAuthInfoRequest, registerType, userSchemaInterface } from "../../appTypes/types";
import { TwilloPhoneOtpSender } from "../../helpers/sendPhoneOtp";
import BankModel from "../../models/bank";
import { decrypt } from "../../helpers/decrypt";
import { encrypt } from "../../helpers/encrypt";
import sendMailjetEmail from "../../helpers/mailjetSendMail";
import { getUserIpFunc } from "../../helpers/checkUserIp";
import { time } from "console";



// register user controller
export const userRegisterController = expressAsyncHandler(async (req: Request<{}, {}, registerType>, res:Response ): Promise<void> => {
    const { 
        email,
        fullName,
      password,
        phone,
        role
   } = req.body;

  // check if email and password are sent
  if (!email || !password || !fullName  || !phone ) {
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
    phone,
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


  await registeredUser.save();
  /* send email for verification */

  const option = {
    subject: "Activate Your Account!",
    emailTemplate:"accountVerification",
  
    to: [
      {
        email: createdEmail,
        name: fullName,
      },
    ],
   
    mailData: {
      companyName: "online bank assessment",
      userName: fullName,
      link: verifyEmailEndpoint 
    }
  };

 await sendMailjetEmail(req, res, option);

 
   res.status(201).json({
    status: "success",
    message: "Account created, please verify your email",
    data: registeredUser,
  
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

const encryptedId = encrypt(user._id)

  if (!isPasswordCorrect) {
    if (user.failedLoginCount === 2) { 
     await UserModel.findOneAndUpdate(
        { email },
        { status: "suspended"},
        { new: true } // returns the updated document
     );
      if(!req.clientIp) return
      const { location: { 
        regionName
      }, time, ipAddress, status} =    await  getUserIpFunc(req.clientIp)
      if (status !== "success") { 
        console.log("location data :",location)
        throw new Error("Failed to obtain user ip")
    }
  await sendMailjetEmail(req, res, {
        subject: "Failed Loging Attempt",
        to: [
          {
            email,
             name: user.fullName
          }
        ],
        emailTemplate: "failedLoginTemplate",
    mailData: {
      
          companyName: "Online bank assessment",
          userName: user.fullName,
         link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
          verificationCode: undefined,
          attemptTime:time,
          ipAddress: ipAddress,
          location: regionName
        }

      })
      throw new Error("Account suspended, please check your mail to activate account.")
    }
   await UserModel.findOneAndUpdate(
      { email },
     {
       $inc: {
         failedLoginCount: 1
       }
     },
      { new: true } // returns the updated document
    );
 
  throw new Error("Invalid login credential");
}

const { isEmailVerified } = user;
 
  if (!isEmailVerified) { 
      /* generate  token */
  const emailVerificationToken = user.createEmailVerificationToken();
  await user.save()
  const verifyEmailEndpoint =
    process.env.SERVER_URL +
    "/api/v1/user" +
    "/emailVerify/" +
    user.email +
    "/" +
    emailVerificationToken;



  /* send email for verification */

  const option = {
    subject: "Activate Your Account!",
    emailTemplate:"accountVerification",
  
    to: [
      {
        email: user.email,
        name: user.fullName,
      },
    ],
   
    mailData: {
      companyName: "online bank assessment",
      userName: user.fullName,
      link: verifyEmailEndpoint 
    }
  };

 await sendMailjetEmail(req, res, option);

 throw new Error("Email not verified, please check your mail to verify email")
  }
  
 // check if user is suspended
  if (user.status === "suspended") { 

    if(!req.clientIp) return
    const { location: { 
      regionName
    }, time, ipAddress, status} =    await  getUserIpFunc(req.clientIp)
    if (status !== "success") { 
        throw new Error("Failed to obtain user ip")
    }
await sendMailjetEmail(req, res, {
      subject: "Failed Loging Attempt",
      to: [
        {
          email,
           name: user.fullName
        }
      ],
      emailTemplate: "failedLoginTemplate",
  mailData: {
    
        companyName: "Online bank assessment",
        userName: user.fullName,
       link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
        verificationCode: undefined,
        attemptTime:time,
        ipAddress: ipAddress,
        location: regionName
      }

    })
  /* await sendBrevoEmail(req, res, {
    subject: "Failed Loging Attempt",
    to: [
      {
        email,
         name: user.fullName
      }
    ],
    emailTemplate: "failedLoginTemplate",
    mailData: {
      companyName: "Online bank assessment",
      userName: user.fullName,
      link: `${process.env.SERVER_URL}/api/v1/user/account/suspended/activate/${encryptedId}`,
       verificationCode: undefined
    }

  }) */
  throw new Error("Account suspended, please check your mail to activate account.")
}



const { _id } = user;
// set jwt token for the user
const token = jwt.sign({ id: _id }, process.env.JWT_SECRET as string);

  
  // get user bank details if account is verified

  const bankData = await BankModel.findOne({
    userId: _id
  })
  


// set cookie

res.cookie("token", token, {
  maxAge: 24 * 60 * 60 * 1000, // cookie will expire in 24 hours
  httpOnly: true,
  sameSite: "strict",
  secure: false,
});

  res.status(200).json({
   error: false,
  status: "success",
  message: "Login successful",
    user,
    bankData : bankData && bankData.accountNumber ? bankData : null,
  token
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
  foundUser.status = "approved"
  await foundUser.save();
  /* const url = process.env.CLIENT_URL + "/emailVerified"; */
  res.render("emailVerification")
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

/* controller to generate an OTP to be sent to the users email for passsword update */
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
 

  

  const option = {
    subject: "Forgot Password",
    emailTemplate:"forgotPasswordTemplate",
  
    to: [
      {
        email: userEmail,
        name: fullName,
      },
    ],
   
    mailData: {
      companyName: "online bank assessment",
      userName: fullName,
      link: "",
      verificationCode:code
    }
  };

   await sendMailjetEmail(req, res, option);
  /*  mailSender() */
  res.status(200).json({
    error: false,
    status: "success",
    message: "Hi, a change password OTP has been sent to your mail",
    data: {
      userEmail
    }

  });
});


// controller to verify the otp sent to the users email for password change
export const changePasswordOTPVerificationController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { email, token } = req.body;
  if (!email || !token) {
    throw new Error("Missing credentials");
  }

  const foundUser = await UserModel.findOne({
    email
  });
  if (!foundUser) {
    res.status(401).json({
   error: false,
      status: false,
      message: "user not found",
 });
      return 
  }

  /* check if token is valid */

  const isTokenValid = foundUser.isPasswordResetTokenValid(token);

  if (!isTokenValid) {
    throw new Error("Incorrect or expired OTP");
  }

  foundUser.passwordResetExpires = null;
  foundUser.passwordResetToken = null;
  foundUser.isPasswordForgetOtpVerified = true;

  await foundUser.save();


  res.status(200).json({
    error: false,
    status: "success",
    message: "OTP verified successfully",
    data: {
      email: foundUser.email
    }
  });
});



// controller to change the users password to the new password
export const changePasswordController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
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

  /*  check if the otp sent to the user has been verified */

  if (!foundUser.isPasswordForgetOtpVerified) { 
    throw new Error("Password reset OTP not verified");
  }


  //  set all fields to its default state after changing the password
  const { email: emailSaved, fullName } = foundUser;
  foundUser.password = password;
  foundUser.isPasswordForgetOtpVerified = false;

  await foundUser.save();

 
  const option = {
    subject: "Password Update Success",
    emailTemplate:"passwordUpdateSuccessTemplate",
  
    to: [
      {
        email: emailSaved,
        name: fullName,
      },
    ],
   
    mailData: {
      companyName: "online bank assessment",
      userName: fullName,
      link:"https://ukonuluckyportfolio.vercel.app/",
    }
  };

  sendMailjetEmail(req, res, option);

  /* sendBrevoEmail(option); */

  res.status(200).json({
    error: false,
    status: true,
    message: "Password updated successfully",
  });
});




export const registerUserPhoneController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
 

  const id = req.user?._id
  const { phone } = req.body
  

  const isIdVallid = id && isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }
  if (!phone) { 
     throw new Error("Missing credentials")
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
  
  await TwilloPhoneOtpSender({
    OTP: otp,
   receivingNumber: phone,
    message:"phone verifcation code"
  })

  res.status(200).json({
    status: "true",
    message: "Verification OTP sent to your phone, please verify"
  })
  return 
 
});


export const verifyUserPhoneController = expressAsyncHandler(async (req:IGetUserAuthInfoRequest, res:Response): Promise<void> => {
  const id = req.user?._id
  const { OTP } = req.body
  if (!id || !OTP) { 
    throw new Error("Missing crredentials")
 }

 
  const isIdVallid = isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

 
  const user = await UserModel.findById(id)

  if (!user) { 
    res.status(404).json({
      status: "false",
      message: "User not found"
    })
    return
  }


  const { result, accountNumber, accountName, userId} = user.isPhoneNumberVerificationOTPValid(OTP)

 await user.save()
  if (!result) { 
    res.status(400).json({
      status: "false",
      message: "Incorrect or Invalid Otp. Please retry"
    }
      
    )
    return 
  }

  const accountSave = await BankModel.create(
    {
      accountNumber,
      accountName,
      userId

    }
  )
  if (!accountSave) { 
  throw new Error("Error occured in account creation, please retry phonenumber verification")
  }

  res.status(200).json({
    status: "success",
    message: "Phone number successfully verified and account created successfuly"
  })
 
});


export const getSingleUserController = expressAsyncHandler(async (req, res): Promise<void> => {
  
  const { id } = req.params;
  const decryptedId = decrypt(id)
  const isIdVallid = isValidObjectId(decryptedId.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  const userFound = await UserModel.findById(decryptedId);
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
  
  const decryptedId = decrypt(id)
  const isIdVallid = isValidObjectId(decryptedId.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  if ( user && user._id.toString() !== decryptedId.toString()) { 
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

  const deletedUser = await UserModel.findByIdAndDelete(decryptedId);

  if (!deletedUser) {
    throw new Error("Failed to delete user");
  }

   res.status(201).json({
    status: "success",
    message: "User deleted successfully",
    data: deletedUser,
  });
});


export const 
getBankAccountDetailsController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response) => { 

  const id = req.user?._id

  const getAccount = await BankModel.findOne({
    userId: id?.toString() 
  }).populate<{
    userId: userSchemaInterface  // this tells typescript the type of values that is being populated at the userId field
  }>("userId").exec()
  
  if (!getAccount) { 
    throw new Error("No account found")
  }
  res.status(200).json({
    status: "true",
    message: "Account successfully fetched",
    data: getAccount
  })
  
})


export const createTransferPinController = expressAsyncHandler(async(req:IGetUserAuthInfoRequest, res:Response) => { 
  const id = req.user?._id
  const { transferPin } = req.body
  if (!transferPin) { 
    throw new Error("Missing crredentials")
  }
  

  const getAccount = await BankModel.findOne({
    userId: id?.toString() 
  }).populate<{
    userId: userSchemaInterface  // this tells typescript the type of values that is being populated at the userId field
  }>("userId").exec()
  if (!getAccount) { 
    res.status(404).json({
      status: "false",
      message: "Account not found"
    })
    return
  }

  // generate OTP
  const getOtp = getAccount.createTransferPinVerificationOTP(transferPin)
  // send otp to user phone
  const phone = getAccount?.userId?.phone
await getAccount.save()
 await  TwilloPhoneOtpSender({
    OTP: getOtp,
   receivingNumber: phone,
    message: "create transfer pin OTP"
  })

  res.status(200).json({
    status: "success",
    message: "Phone verification OTP sent, please verify",
    data: getAccount
  })
  
})



export const verifyBankTransferPinController = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
  const id = req.user?._id
  const { OTP } = req.body
  if (!id || !OTP) { 
    throw new Error("Missing crredentials")
 }

 
  const isIdVallid = isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

 
  const account = await BankModel.findOne({
    userId: id
  })

  if (!account) { 
    res.status(404).json({
      status: "false",
      message: "Account not found"
    })
    return
  }


  const result = account.isTransferPinVerificationOTPValid(OTP)

 await account.save()
  if (!result) { 
   throw new Error("Account verifcation pin expired or invalid. Please retry")
      
  }


  res.status(200).json({
    status: "success",
    message: "Transfer pin created successfuly"
  })
 
});


export const suspendedAccountActivation = expressAsyncHandler(async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => { 
  const { id } = req.params

  if (!id) throw new Error("Missing credentials")

  const userId = decrypt(id)

  const isIdVallid = isValidObjectId(userId.toString());  // check if userId is a valid mongoose id
  if (!isIdVallid) {
     res.status(404).json({
      status: "failed",
      message: "Invaild id or id not found",
     });
      return
  }

  
  const user = await UserModel.findByIdAndUpdate(
    userId, {
      failedLoginCount: 0,
      status: "approved"
  },
    {
      new: true
    }
  )

  if (!user) throw new Error("user does not exist")
  res.render("suspendedAccountActivation", {
    userName: user.fullName,
    companyName: "Online bank assessment",
    loginUrl:`${process.env.SERVER_URL}/api/v1/user/login`
    
  })
  // send user an otp to verifiy user

}
)



