import UserModel from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import status from 'http-status'
import dotenv from 'dotenv'
import trasporter from '../config/emailConfig.js'
dotenv.config()

const SEC_KEY = process.env.SEC_KEY


//User Registration
export const userRegister = async (req, res) => {

    const { name, email, password, confirm_password, tc } = req.body

    //1.check if user(found) already registered or not
    const user = await UserModel.findOne({ email: email })
    if (user) {
        //2
        res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Email Already Exists..."
        })
    } else {
        //3.before registration we need to check all fields fulfilled
        if (name && email && password && confirm_password && tc) {
            //4.if all fields fulfilled we need to check the password and confirm_password are the same
            if (password === confirm_password) {
                try {
                    //6.if all the fields are fullfilled and password and confirm_password are match then will will register  the user with encrypted password.
                    const salt = await bcrypt.genSalt(10)
                    const hashPassword = await bcrypt.hash(password, salt);
                    const userData = await UserModel.create({
                        name: name,
                        email: email,
                        password: hashPassword,
                        tc: tc,
                    })

                    //getting current user that has been saved after register and login
                    const saved_user = UserModel.findOne({ email: email })
                    //Generating jwt token with the help of of user_id
                    const token = jwt.sign({ userID: saved_user._id }, SEC_KEY, { expiresIn: '1d' })


                    //message after register user.
                    res.status(status.CREATED).json({
                        success: true,
                        message: "User Registered successfully...",
                        userData,
                        token: token
                    })

                } catch (error) {
                    //7.
                    res.status(status.BAD_REQUEST).json({
                        success: false,
                        message: "Unable To Register Something Went Wrong...",
                        Error: error.message
                    })
                }

                //5.
            } else {
                res.status(status.BAD_REQUEST).json({
                    success: false,
                    message: "Password And confirm_password doesn't Match..."
                })
            }

        } else {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message: "All Fields Are Required..."
            })
        }

    }
}



export const userLogin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (email && password) {
            //verify email with the database
            const user = await UserModel.findOne({ email: email })
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password)
                //verify the email and password
                if ((user.email === email) && isMatch) {
                    //Generate jwt token after user login
                    const token = jwt.sign({ userID: user._id }, SEC_KEY, { expiresIn: '1d' })

                    res.status(status.OK).json({
                        success: true,
                        message: `Welcome ${user.name}`,
                        token: token
                    })
                } else {
                    res.status(status.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid Credentials..."
                    })
                }
            } else {
                res.status(status.BAD_REQUEST).json({
                    success: false,
                    message: "Your Are Not Registered User..."
                })
            }
        } else {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message: "All Fields Are Required..."
            })
        }

    } catch (error) {
        res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Unable to Login...",
            error
        })
    }
}


export const changePassword = async (req, res) => {
    const { password, confirm_password } = req.body
    //check both password and confirm_password are exists
    if (password && confirm_password) {
        //check both password and confirm_password are same
        if (password !== confirm_password) {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message: "New Password and Confirm_password doesn't match..."
            })
        } else {
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            //Here we need validate user so that we can use middleware
            await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
            res.send({
                success: true,
                message: "Password Changed Successfully..."
            })
        }

    } else {
        res.status(status.BAD_REQUEST).json({
            success: false,
            message: "All Fields Are Required..."
        })
    }

}

//get user profile(when user login)
export const loggedUserProfile = (req, res) => {
    const loggedUser = req.user
    res.status(status.OK).json({
        success: true,
        user: loggedUser
    })
}

// sending the User Password Reset Email
export const sendUserPasswordResetEmail = async (req, res) => {
    //from fontend user send an email so that we are getting the email from the backend
    const { email } = req.body
    if (email) {
        //check whether the email is registered or not
        const user = await UserModel.findOne({ email: email })
        console.log(user);
        if (user) {
            const secret = user._id + SEC_KEY
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
            const link = `https://localhost:3000/api/user/reset/${user._id}/${token}`
            console.log(link);

            //send email
            let info = await trasporter.sendMail({
                from : process.env.FROM,
                to : user.email,
                subject : 'Password reset-link',
                html : `<a href=${link}>Click Here</a> tp reset your password`
            })

            //After mail send to the user
            res.status(status.OK).json({
                success: true,
                message: "Password Reset mail has been sent, Please check your mail...",
                info : info
            })
        } else {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message: "Email Does Not Exists..."
            })
        }

    } else {
        res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Email Is Required..."
        })
    }
}



export const userPasswordReset = async (req, res) => {
    const { password, confirm_password } = req.body
    const { id, token } = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + SEC_KEY
    try {
        jwt.verify(token, new_secret)
        if (password && confirm_password) {
            if (password === confirm_password) {
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password, salt);
                await UserModel.findByIdAndUpdate(user._id , {$set : {password : newHashPassword}})

                res.status(status.OK).json({
                    success: false,
                    message: "Password Reset/Updated Successfully..."
                })

            } else {
                res.status(status.BAD_REQUEST).json({
                    success: false,
                    message: "Password and confirm_password doesn't match..."
                })
            }
        } else {
            res.status(status.BAD_REQUEST).json({
                success: false,
                message: "All fields are required..."
            })
        }
    } catch (error) {
        console.log(error.message);
        res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Invalid token..."
        })
    }
}