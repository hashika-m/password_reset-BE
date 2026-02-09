import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRoute from './routes/userRoute.js'
import cors from 'cors'

dotenv.config()
const app=express()
const PORT=process.env.PORT ||8000
connectDB()

// middleware
app.use(express.json())
// front end api calling usage
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    
  })
);



// routes
app.use('/api',userRoute)



// endpoints using postman
app.get('/',(req,res)=>{
    res.send('api endpoint from server.js')
})

app.listen(PORT,()=>{
    console.log(`server is listening on ${PORT} `)
})


