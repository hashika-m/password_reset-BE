import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        console.log(process.env.MONGO_URI)
       await mongoose.connect(process.env.MONGO_URI)
       console.log('DB is connected')
    }catch(err){
        console.log('DB not connected:',err)
        process.exit(1)
    }
}
export default connectDB
