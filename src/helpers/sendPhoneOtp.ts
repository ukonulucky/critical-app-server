// Your AccountSID and Auth Token from console.twilio.com
export const TwilloPhoneOtpSender = async() => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const client = require('twilio')(accountSid, authToken);
    try {
 
        const response = await client.messages
            .create({
                body: 'Hello from twilio-node',
                to: '+447881168250', // Text your number
                from: '+12345678901', // From a valid Twilio number
            })
        if (!response) {
            throw new Error("Failed to send OTP to phone, please retry...")
        }
        return response
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
        throw new Error("Unknown Error")
    }
}
