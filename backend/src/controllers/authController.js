import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; 
import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  try {
    console.log("Data received:", req.body);
    const { 
      email, password, fullname, role, userType, 
      matricNumber, department, hostel, college, staffId, bio 
    } = req.body;

    // Extract Cloudinary URLs provided by the Multer-Cloudinary middleware
    const idCardUrl = req.files?.idCard ? req.files.idCard[0].path : null;
    const selfieUrl = req.files?.selfie ? req.files.selfie[0].path : null;

    if (!email || !password || !fullname) {
      return res.status(400).json({ status: "error", message: "Required fields missing." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMatric = matricNumber?.trim().toUpperCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "Email already registered." });
    }

    // Validation for Dispatchers
    if (role === 'DISPATCHER' && (!idCardUrl || !selfieUrl)) {
      return res.status(400).json({ 
        status: "error", 
        message: "Dispatchers must upload an ID card and a verification selfie." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName: fullname,
        role: role || 'REQUESTER', 
        userType: userType, 
        matricNumber: (userType === 'STUDENT' || role === 'DISPATCHER') ? normalizedMatric : null,
        department: department || null,
        hostel: userType === 'STUDENT' ? hostel : null,
        college: userType === 'STUDENT' ? college : null,
        staffIdUsername: userType === 'STAFF' ? staffId : null,
        
        // Cloudinary Image URLs & Dispatcher fields
        bio: role === 'DISPATCHER' ? bio : null,
        idCardUrl: idCardUrl,
        selfieUrl: selfieUrl,
        
        // Dispatchers require admin approval; others are approved by default
        isApproved: role !== 'DISPATCHER', 
        
        verificationToken, 
      },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Verify your CampusRun Account',
        html: `<h1>Welcome to CampusRun!</h1><p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}">Verify Email Address</a>`
      });
      return res.status(201).json({ status: "success", message: "Registration successful! Check your email to verify." });
    } catch (error) {
      return res.status(201).json({ 
        status: "success", 
        message: "Account created, but we couldn't send the verification email. Please use 'Resend Verification' on the login page." 
      });
    }
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ status: "error", message: "Server error during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Account not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        status: "error", 
        message: "Verification required.",
        isVerified: false
      });
    }

    try {
      await prisma.loginRecord.create({
        data: {
          userId: user.id,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || "127.0.0.1",
          userAgent: req.headers['user-agent'] || "Unknown Device",
        },
      });
    } catch (recordError) {
      console.error("❌ Database Error: Could not save login record", recordError);
    }

    res.json({
      status: "success",
      token: generateToken(user.id),
      user: { 
        id: user.id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        userType: user.userType,
        matricNumber: user.matricNumber,
        department: user.department,
        hostel: user.hostel,
        college: user.college,
        isApproved: user.isApproved // Added so frontend knows if they can work yet
      }
    });
  } catch (error) {
    console.error("❌ Login Controller Error:", error);
    res.status(500).json({ status: "error", message: "Login failed." });
  }
};

/**
 * FORGOT PASSWORD - SENDS 4-DIGIT OTP
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: "error", message: "Email required." });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Email not registered." });
    }

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    await prisma.otp.create({
      data: { 
        email: normalizedEmail, 
        code: otpCode, 
        expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes
      }
    });

    console.log(`✅ New OTP generated for ${normalizedEmail}: ${otpCode}`);

    await sendEmail({
      email: normalizedEmail,
      subject: 'Your CampusRun Reset Code',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Use the code below to reset your password:</p>
          <h1 style="color: #ea580c; letter-spacing: 5px; font-size: 40px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>`
    });

    res.status(200).json({ status: "success", message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot PW Error:", error);
    res.status(500).json({ status: "error", message: "Error sending reset code." });
  }
};

/**
 * VERIFY OTP - CONVERTS OTP TO A SECURE RESET TOKEN
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const otpRecord = await prisma.otp.findFirst({
      where: { 
        email: normalizedEmail, 
        code: cleanCode 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        status: "error", 
        message: "Invalid code. Please check your email for the most recent code." 
      });
    }

    const now = new Date();
    if (now > otpRecord.expiresAt) {
      return res.status(400).json({ 
        status: "error", 
        message: "Code has expired. Please request a new one." 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { 
        resetToken, 
        resetTokenExpires: new Date(Date.now() + 15 * 60000) 
      }
    });

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    res.json({ status: "success", resetToken });
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    res.status(500).json({ status: "error", message: "Verification failed." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    
    const user = await prisma.user.findFirst({
      where: { 
        resetToken, 
        resetTokenExpires: { gt: new Date() } 
      }
    });

    if (!user) return res.status(400).json({ status: "error", message: "Invalid or expired reset session." });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 12),
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ status: "success", message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Reset failed." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    
    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid or expired verification link." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });
    
    res.json({ status: "success", message: "Email verified successfully!" });
  } catch {
    res.status(500).json({ status: "error", message: "Verification failed." });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(404).json({ status: "error", message: "Account not found." });
    if (user.isVerified) return res.status(400).json({ status: "error", message: "Account already verified." });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { verificationToken }
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      email: normalizedEmail,
      subject: 'Verify your CampusRun Account',
      html: `<p>Click here to verify your account:</p><a href="${verificationUrl}">Verify Email</a>`
    });

    res.json({ status: "success", message: "Verification email resent." });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to resend email." });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { 
        id: true,
        email: true,
        fullName: true,
        role: true,
        userType: true,
        matricNumber: true,
        isVerified: true,
        createdAt: true,
        department: true,
        hostel: true,
        college: true,
        isApproved: true, // Added
        bio: true,       // Added
        idCardUrl: true, // Added
        selfieUrl: true  // Added
      }
    });
    
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    res.json({ status: "success", user });
  } catch {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};