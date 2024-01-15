import express  from "express";
import { changePassword, loggedUserProfile, sendUserPasswordResetEmail, userLogin, userPasswordReset, userRegister } from "../controllers/userController.js";
import { checkUserAuth } from "../middlewares/authMiddleware.js";
const userRouter = express.Router();


//Public Routes
userRouter.post('/register', userRegister)
userRouter.post('/login', userLogin)
userRouter.post('/send-reset-password-email', sendUserPasswordResetEmail)
userRouter.post('/reset-password/:id/:token', userPasswordReset)



//Protected(authenticated) Routes
userRouter.post('/changepassword', checkUserAuth ,changePassword)
userRouter.get('/loggeduser', checkUserAuth ,loggedUserProfile)





export default userRouter