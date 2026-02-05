import express from 'express'
import { dashboard, login, signUp, forgotPassword, resetPassword } from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'


const router = express.Router()

// test
// router.get('/test',(req,res)=>{
//     res.json({message:'router set successfully'})
// })


router.post('/signup', signUp)
router.post('/login', login)
router.get('/dashboard', authMiddleware, dashboard)
router.post('/forgotPassword',forgotPassword)
router.post('/resetPassword/:token',resetPassword)



export default router