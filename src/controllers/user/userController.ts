import expressAsyncHandler from "express-async-handler"
import jwt, { JwtPayload} from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"


import isValidObjectId from "../../helpers/mongooseIdValidity";
import UserModel from "../../models/user";
import { registerType } from "../../appTypes/types";
import sendBrevoEmail from "../../helpers/mailsSender";



// register user controller
const userRegisterController = expressAsyncHandler(async (req: Request<{}, {}, registerType>, res:Response ): Promise<void> => {
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
    message: "Please verify your email",
    data: registeredUser,
    meta: message,
  });
});

/* verify user email */

const verifyEmailController = expressAsyncHandler(async (req: Request<{
    email: string,
    token: string
}>, res): Promise<void> => {
  const { email, token } = req.params;
 

  if (!token || !email) {
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
  foundUser.isEmailVerified = true;
  foundUser.accountVerificationToken = null;
  await foundUser.save();
  const url = process.env.CLIENT_URL + "/emailVerified";
  res.redirect(url);
});

const userLoginController = expressAsyncHandler(async (req: Request<{}, {}, {
    email: string,
    password: string
}>, res: Response, next: NextFunction): Promise<void> => {
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
  const isPasswordCorrect = user.comparePassword(password);

  if (!user || !isPasswordCorrect) {
    throw new Error("Invalid login credential");
  }

  const { isEmailVerified, accountVerificationToken, fullName } = user;
  if (!isEmailVerified) {
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

const userAuthticateController = expressAsyncHandler(async (req: Request<{}, {}>, res:Response): Promise<void> => {
  try {
    // console.log(req)
    const { token } = req.cookies;
    if (!token) {
       res.status(200).json({
        isAuthenticated: false,
       });
        return
    }
 
      const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    const foundUser = await UserModel.findById(id);
    if (!foundUser) {
       res.status(401).json({
          isAuthenticated: false,
          user: "user not logged in"
       });
        return
    }
   res.status(200).json({
      isAuthenticated: true,
      userName: foundUser.fullName,
      id: foundUser._id,
   });
    
  } catch (error) {
   res.status(401).json({
      isAuthenticated: false,
    });
  }
});

const getAllUsersController = expressAsyncHandler(async (req, res): Promise<void> => {
  try {
    const users = await UserModel.find();
    res.status(201).json({
      status: "success",
      users,
    });
  } catch (error ) {
      if (error instanceof Error) {
          throw new Error(error.message);
      } else { 
      throw new Error("Internal server error")
      }
  }
});

const getSingleUserController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { id } = req.params;
  const isIdVallid = isValidObjectId(id.toString());
  if (!id || !isIdVallid) {
     res.status(404).json({
      status: "false",
      message: "Invaild tid not found",
     });
      return
  }

  const userFound = await UserModel.findById(id);
  if (!userFound) {
     res.status(404).json({
      status: "false",
      message: "User not found",
     });
      return
  }

res.status(200).json({
    status: "success",
    user: userFound,
  });
});

const logOutUserController = expressAsyncHandler(async (req, res): Promise<void> => {
  res.cookie("token", "", {
    maxAge: 1,
  });
  res.status(200).json({
    isAuthenticated: false,
    message: "user logged out",
  });
});

/* forgot password */

const forgotPasswordController = expressAsyncHandler(async (req, res): Promise<void> => {
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

const changePasswordController = expressAsyncHandler(async (req, res): Promise<void> => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
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
  });
});

const deleteUserController = expressAsyncHandler(async (req, res) : Promise<void> => {
  const { id } = req.params;

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

module.exports = {
  userRegisterController,
  userLoginController,
  userAuthticateController,
  getAllUsersController,
  getSingleUserController,
  logOutUserController,
  verifyEmailController,
  forgotPasswordController,
  changePasswordController,
  deleteUserController
};