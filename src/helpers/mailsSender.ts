import { mailSenderType } from "../appTypes/types"
import {Request, Response } from "express"

const axios = require("axios")

const sendBrevoEmail = async function (req:Request, res:Response, options: mailSenderType) {


  const { subject,to, emailTemplate,mailData} = options; 

  req.app.render(emailTemplate, mailData, async(err, html) => { 
    if (err || !html) {
      console.error('Template render error:', err);
    throw new Error("Failed to render email template")
  
    }

    const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
   

    try {

      const data = {
        sender: { email: 'fadoyint@gmail.com', name: mailData.companyName }, // { email: 'sender@example.com', name: 'Sender Name' }
        to:to, // [{ email: 'recipient@example.com', name: 'Recipient Name' }]
        subject: subject,
        htmlContent:html,
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
          console.log("mail error: ",error)
            console.log("EMAIL ERR/BREVO::", error.message);
         
          } else {
            console.error("An unknown error occurred");
              
      console.error("Error sending email:");
          }
    
    }

  } )
   
}
  
export default sendBrevoEmail