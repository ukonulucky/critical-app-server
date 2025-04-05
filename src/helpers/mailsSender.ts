import { mailSenderType } from "../appTypes/types"

const axios = require("axios")

const sendBrevoEmail = async function (options: mailSenderType) {


    const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
     const { subject,to, emailTemplate, senderName} = options; 
  

    try {

      const data = {
        sender: { email: 'ukonulucky@gmail.com', name: senderName }, // { email: 'sender@example.com', name: 'Sender Name' }
        to:to, // [{ email: 'recipient@example.com', name: 'Recipient Name' }]
        subject: subject,
        htmlContent: emailTemplate,
        headers: { "Homiee-User-Id": "unique-id-1234" },
      };
  
      const response = await axios.post(BREVO_API_URL, data, {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Email sent:", response?.data);
    } catch (error) {
        if (error instanceof Error) {
            console.log("EMAIL ERR/BREVO::", error.message);
         
          } else {
            console.error("An unknown error occurred");
              
      console.error("Error sending email:");
          }
    
    }
}
  
export default sendBrevoEmail