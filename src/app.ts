
import express, { Response, Request, NextFunction } from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDb from "./config/dbConnect";
import cors from "cors"
import userRouter from "./routes/userRoutes";
dotenv.config()



const app = express()

const PORT = process.env.PORT || 5000;


/* middle wares */
const corsOptions = {
    origin:"*",
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}

//Middleware

app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))





// Routes

/* app.use("/api/v1/admin", adminRouter) */

app.use("/api/v1/user", userRouter)



/* for home route */
app.get("/", async(req, res) => { 
    res.send("Server running")
   })

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