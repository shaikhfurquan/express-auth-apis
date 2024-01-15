import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import status from 'http-status'
import dotenv from 'dotenv'
dotenv.config()

const SEC_KEY = process.env.SEC_KEY

export const checkUserAuth = async (req,res,next) => {
    let token 
    const {authorization} = req.headers
    //check if authorization have the value if it is then will verify that
    if(authorization && authorization.startsWith('Bearer')){
        try {
            //getting token from headers
            token = authorization.split(' ')[1]
            // console.log( "token===>" ,  token);
            // console.log( "auth===>" ,  authorization);

            //verify that token
            const {userID} = jwt.verify(token , SEC_KEY)
            console.log(userID);

            //Get user from token
            req.user = await UserModel.findById(userID).select('-password')
            // console.log(req.user);
            next()
        } catch (error) {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message : "Unauthorized User...",
            })
        }
    }
    if(!token){
        res.status(status.UNAUTHORIZED).json({
            success: false,
            message : "Unauthorized User , No Token...",
        })
    }
}
