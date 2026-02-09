import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import nodemailer from 'nodemailer'





export const register = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400)
      res.json({ message: 'All fields are required' })
      return
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {

      res.status(400)
      res.json({ message: 'User already exists' })
      return
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      email, password: hashPassword
    })
    res.status(201)
    res.json({ message: 'User created successfully', user })
  } catch (err) {
    res.status(500)
    res.json({ message: err })
  }

}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400)
      res.json({ message: 'All fields required' })
      return
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      res.status(401)
      res.json({ message: 'Unauthorized user credentials' })
      return
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      token,
      user: {
        email: user.email,
      }
    })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
    return
  }


}

export const dashboard = async (req, res) => {
  try {
    res.json({
      message: 'Welcome to dashboard',
      email: req.user.email,

    })
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized user' })
  }
}


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.trim();
    console.log("Forgot password email received:", cleanEmail);

    const user = await User.findOne({
      email: { $regex: `^${cleanEmail}$`, $options: "i" },
    });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = Math.random().toString(36).slice(-8);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;
    console.log("RESET PASSWORD LINK (FALLBACK):", resetLink);

    const testAccount = await nodemailer.createTestAccount();
    console.log("ETHEREAL ACCOUNT:", testAccount.user);

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      tls: { rejectUnauthorized: false },
    });

    console.log("SENDING EMAIL...");
    // console.log("RESET LINK (ALWAYS PRINTS):", resetLink);


    const info = await transporter.sendMail({
      from: '"Admin" <admin@email.com>',
      to: user.email,
      subject: "Reset Password",
      html: `<a href="${resetLink}">${resetLink}</a>`,
    });

    // console.log("EMAIL SENT");
    // console.log("INFO:", info);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("ETHEREAL PREVIEW URL:", previewUrl);

    res.json({
      message: "Reset link sent (Ethereal)",
      previewUrl,
    });

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
      // user: { password: user.password, email: user.email }
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
