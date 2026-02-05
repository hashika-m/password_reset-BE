import jwt from 'jsonwebtoken'

const authMiddleware=async (req,res,next)=>{
    const token =req.headers.authorization?.split(' ')[1]

    if(!token){
        res.status(401)
        res.json({message:'Token is needed'})
        return
    }

    try{
        req.user=jwt.verify(token,process.env.JWT_SECRET)
       next()
       return
    }catch(err){
        res.status(403)
        res.json({message:'Token is needed'})
        return
    }
}

export default authMiddleware