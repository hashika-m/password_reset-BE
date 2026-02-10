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


// using etheral email:
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const cleanEmail = email.trim();
//     console.log("Forgot password email received:", cleanEmail);

//     const user = await User.findOne({
//       email: { $regex: `^${cleanEmail}$`, $options: "i" },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Email not found" });
//     }

//     const token = Math.random().toString(36).slice(-8);

//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     // Respond immediately to avoid timeout
//     res.json({
//       message: "If the email exists, a reset link has been sent.",
//     });

//     // Handle email sending asynchronously in the background (fire-and-forget)
//     setImmediate(() => {
//       const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;
//       console.log("RESET PASSWORD LINK (FALLBACK):", resetLink);

//       nodemailer.createTestAccount((err, testAccount) => {
//         if (err) {
//           console.error("CREATE TEST ACCOUNT ERROR:", err);
//           return;
//         }
//         console.log("ETHEREAL ACCOUNT:", testAccount.user);

//         const transporter = nodemailer.createTransport({
//           host: "smtp.ethereal.email",
//           port: 465,
//           secure: true,
//           auth: {
//             user: testAccount.user,
//             pass: testAccount.pass,
//           },
//           connectionTimeout: 60000, // 60 seconds
//           greetingTimeout: 60000,
//           socketTimeout: 60000,
//         });

//         console.log("SENDING EMAIL...");

//         transporter.sendMail({
//           from: '"Admin" <admin@email.com>',
//           to: user.email,
//           subject: "Reset Password",
//           html: `<a href="${resetLink}">${resetLink}</a>`,
//         }, (err, info) => {
//           if (err) {
//             console.error("SEND EMAIL ERROR:", err);
//             return;
//           }
//           console.log("EMAIL SENT");
//           console.log("INFO:", info);

//           const previewUrl = nodemailer.getTestMessageUrl(info);
//           console.log("ETHEREAL PREVIEW URL:", previewUrl);
//         });
//       });
//     });

//   } catch (err) {
//     console.error("FORGOT PASSWORD ERROR:", err);
//     // Since response is already sent, log the error but don't send another response
//   }
// };

// using brevo -smtp key
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const cleanEmail = email.trim().toLowerCase();
//     console.log("Forgot password email received:", cleanEmail);

//     const user = await User.findOne({ email: cleanEmail });

//     if (!user) {
//       return res.status(400).json({ message: "Email not found" });
//     }

//     const token = Math.random().toString(36).slice(-8);

//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     // Respond immediately
//     res.json({
//       message: "Reset link has been sent via email.",
//     });

//     // Send email in background
//     setImmediate(async () => {
//       try {
//         const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;
//         console.log("RESET PASSWORD LINK:", resetLink);

//         const transporter = nodemailer.createTransport({
//           host: process.env.SMTP_HOST,
//           port: Number(process.env.SMTP_PORT), // 587
//           secure: false,
//           auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//           },
//         });

//         await transporter.sendMail({
//           from: `"Admin" <${process.env.SMTP_FROM}>`,
//           to: user.email,
//           subject: "Reset Password",
//           html: `
//             <p>You requested a password reset.</p>
//             <p>Click the link below to reset your password:</p>
//             <a href="${resetLink}">${resetLink}</a>
//             <p>This link expires in 10 minutes.</p>
//           `,
//         });

//         console.log("RESET PASSWORD EMAIL SENT");
//       } catch (emailErr) {
//         console.error("EMAIL SEND ERROR:", emailErr);
//       }
//     });

//   } catch (err) {
//     console.error("FORGOT PASSWORD ERROR:", err);
//   }
// };


// using brevo- api key and sib-api-v3-sdk package

import SibApiV3Sdk from "sib-api-v3-sdk";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log("Forgot password email received:", cleanEmail);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = Math.random().toString(36).slice(-8);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // respond immediately
    res.json({
      message: "Reset link has been sent via email.",
    });

    // ===== BREVO EMAIL (background) =====
    setImmediate(async () => {
      try {
        const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;
        console.log("RESET PASSWORD LINK:", resetLink);

        // Brevo config
        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications["api-key"].apiKey =
          process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        await apiInstance.sendTransacEmail({
          sender: {
            email: process.env.BREVO_SENDER_EMAIL,
            name: process.env.BREVO_SENDER_NAME,
          },
          to: [
            {
              email: user.email,
            },
          ],
          subject: "Reset your password",
          htmlContent: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link expires in 10 minutes.</p>
          `,
        });

        console.log("RESET PASSWORD EMAIL SENT (BREVO)");
      } catch (emailErr) {
        console.error("BREVO EMAIL ERROR:", emailErr);
      }
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
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
