import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import nodemailer from 'nodemailer'





export const signUp=async(req, res)=>{
    try{
        const {email, password}=req.body

        if(!email||!password){
            res.status(400)
            res.json({message:'All fields are required'})
             return
        }
   
        const existingUser=await User.findOne({email})
        if(existingUser){
            
            res.status(400)
            res.json({message:'User already exists'})
             return
        }
        const hashPassword= await bcrypt.hash(password,10)
        const user=await User.create({
             email,password:hashPassword
        })
        res.status(201)
        res.json({message:'User created successfully',user})
    }catch(err){
      res.status(500)
      res.json({message:err})
    }
    
}

export const login=async(req, res)=>{
    try{
       const {email,password}=req.body
       if(!email||!password){ 
        res.status(400)
        res.json({message:'All fields required'})
         return
       }
    
       const user=await User.findOne({email})
       if(!user){
        res.status(401).json({message:'User not found'})
         return
       }
       const isPasswordMatch=await bcrypt.compare(password,user.password)
       if(!isPasswordMatch){
        res.status(401)
        res.json({message:'Unauthorized user credentials'})
        return
       }

       const token= jwt.sign(
        {id:user._id,email:user.email,},
        process.env.JWT_SECRET,
        {expiresIn:'1h'}
     )

     res.json({token,
        user:{
            eamil:user.email,
            password:user.password

        }
     })
     return
    }catch(err){
       res.status(500).json({message:err.message})
       return
    }
  
    
}

export const dashboard=async(req,res)=>{
    try{
        res.json({
            message:'Welcome to dashboard',
            email:req.user.email,
            
        })
    }catch(err){
        res.status(401).json({message:'Unauthorized user'})
    }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    // randomstring as token
    const token = Math.random().toString(36).slice(-8);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // mail tsetaccount
    const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});


    // // info & resetlink in mail
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const info = await transporter.sendMail({
      from: '"Admin" <admin@email.com>',
      to: user.email,
      subject: "Reset Password",
      html: `<h4>Reset Password link is given below. Click the link and reset your password.</h4>
         <a href="${resetLink}">${resetLink}</a>`,
    });
    const link=nodemailer.getTestMessageUrl(info)
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    res.json({ message: "Reset link sent" ,link});

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // validation
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match" });
    }

    // find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful. Please login again.",
      user:{password:user.password,email:user.email}
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
