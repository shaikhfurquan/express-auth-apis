import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

const MONGO_URL = process.env.MONGO_URL

const connectDB = () =>{
    mongoose.connect(MONGO_URL).then(()=>{
        console.log(`Connected to ${MONGO_URL}`);
    }).catch((err)=>{
        console.log(`Error connecting to DB`);
    })
}

export default connectDB