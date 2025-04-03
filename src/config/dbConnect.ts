import mongoose from "mongoose";


const connectDb = async (): Promise<mongoose.Mongoose> => { 
    try {
        return await mongoose.connect(process.env.MONGU_URL as string)
    } catch (error: any) {
    console.log("fauled to connect  to Db "+ error)
       throw new Error(error)
       
    }
}

export default connectDb