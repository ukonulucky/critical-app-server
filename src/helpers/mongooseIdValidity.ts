import mongoose from "mongoose"

// Function to check if a string is a valid ObjectId
function isValidObjectId(id: string) {
  if(!id) throw new Error("Invalid url")
  return mongoose.Types.ObjectId.isValid(id);
}

export default isValidObjectId
