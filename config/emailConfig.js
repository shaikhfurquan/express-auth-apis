import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

let trasporter = nodemailer.createTransport({
    host : process.env.Email_HOST,
    port : process.env.Email_PORT,
    secure : false,
    auth :{
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    }
})



export default trasporter