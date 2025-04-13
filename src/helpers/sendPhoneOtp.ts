
import twilio from "twilio"
import { twillioOptionType } from "../appTypes/types";
export const TwilloPhoneOtpSender = async(option: twillioOptionType) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;


    const { 
        OTP,
        receivingNumber,
      message
    } = option
    const client = twilio(accountSid, authToken);
    try {
 /* make api call to twillio to send phone otp */
        const response = await client.messages
            .create({
                body: `online bank assessment ${message} - ${OTP}`,
                to: receivingNumber, // Text your number
                from: process.env.TWILIO_OTP_SENDING_PHONE_NUMBER // From a valid Twilio number
            })
        if (!response) {
            throw new Error("Failed to send OTP to phone, please retry...")
            
        }
        if (response.errorMessage) { 
          throw new Error(response.errorMessage)
        }
       
        return response
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
        throw new Error("Unknown Error")
    }
}
