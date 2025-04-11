
import express, { Response, Request, NextFunction } from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { engine } from "express-handlebars"
import path from "path"
dotenv.config()

import connectDb from "./config/dbConnect";
import userRouter from "./routes/userRoutes";
import adminRouter from "./routes/adminRoutes"





const app = express()

const PORT = process.env.PORT || 5000;


/* middle wares */
const corsOptions = {
    origin:"*",
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}


 /* set static files location */
app.use(express.static(path.join(__dirname,"public")))

/* view engine setting */

app.engine("hbs", engine({
    extname: '.hbs',
 /*    defaultLayout: false // <- disables layout */
  }))  // instruct express to use engine as the remplating engine for any file ending in .hbs

app.set("view engine", "hbs") // instruct the view engine to search for any file ending with hbs to render to the screeen
 
app.set("views", path.join(__dirname, "views"))  // instruct express to search for the views folder at path ./views

//Middleware

app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))


// limts the number of api call from a giving browser 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  




// Routes

/* app.use("/api/v1/admin", adminRouter) */

app.use("/api/v1/user", userRouter)

app.use("/api/v1/admin", adminRouter)

/* for home route */

app.get("/emailVerify", async (req, res) => { 
  res.render("emailVerification")
})

app.get("/", async(req, res) => { 
    res.render("accountVerification", {
        userName: "Samuel",
        companyName: "Online banking",
        link: "https://ukonuluckyportfolio.vercel.app/",
        
    })
})
/* TwilloPhoneOtpSender()  */

app.use((req: Request, res:Response, next:NextFunction) => {
    res.status(404).json({
        message:"route not found"
    })
})

/* handling all errors */
app.use((err: any, req:Request, res:Response, next:NextFunction) => {
    const errorMessage = err.message
    // the stack property tells what area in the application the error happenz
    const stack = err.stack
res.status(500).json({
    message: errorMessage,
    stack
})

})


app.listen(PORT, async() => { 
    try {
       await connectDb()
        console.log("DB connect and server running on port "+ PORT)
    } catch (error: any) {
        console.log("Failed to start server " + error.message)
        process.exit()
    }
})