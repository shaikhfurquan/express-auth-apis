import express from 'express';
import cors from 'cors';
import connectDB from './db/connectDB.js';
import userRouter from './routes/userRouter.js';
import dotenv from 'dotenv';
dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());


//routes
app.use('/api/user' , userRouter)
// app.use('/api/user' , userRouter)


//connection of DB
connectDB()

app.listen(PORT , ()=>{
    console.log(`Server listening on http://localhost:${PORT}`);
})