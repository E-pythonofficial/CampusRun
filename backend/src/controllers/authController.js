import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    console.log("Data received:", req.body);

    const {
      email, password, fullname, role, userType,
      matricNumber, department, hostel, college,
      staffId, reasonToJoin,  // ← bio renamed to reasonToJoin
    } = req.body;

    // Cloudinary URLs from multer middleware
    const idCardUrl = req.files?.idCard?.[0]?.path ?? null;
    const selfieUrl = req.files?.selfie?.[0]?.path ?? null;

    if (!email || !password || !fullname) {
      return res.status(400).json({ status: "error", message: "Required fields missing." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMatric = matricNumber?.trim().toUpperCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "Email already registered." });
    }

    // Dispatchers must upload documents
    if (role === 'DISPATCHER' && (!idCardUrl || !selfieUrl)) {
      return res.status(400).json({
        status:  "error",
        message: "Dispatchers must upload an ID card and a selfie.",
      });
    }

    const hashedPassword    = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log("About to create user with role:", role, "userType:", userType);
    console.log("matricNumber:", normalizedMatric);

    const newUser = await prisma.user.create({
      data: {
        email:           normalizedEmail,
        password:        hashedPassword,
        fullName:        fullname,
        role:            role || 'REQUESTER',
        userType:        userType || 'STUDENT',
        matricNumber:    (userType === 'STUDENT' || role === 'DISPATCHER')
                           ? normalizedMatric
                           : null,
        department:      department      || null,
        hostel:          userType === 'STUDENT' ? (hostel || null) : null,
        college:         userType === 'STUDENT' ? (college || null) : null,
        staffIdUsername: userType === 'STAFF'   ? (staffId || null) : null,

        // Dispatcher-specific fields
        idCardUrl:             idCardUrl,
        selfieUrl:             selfieUrl,
        reasonToJoin:          role === 'DISPATCHER' ? (reasonToJoin || null) : null,
        applicationSubmittedAt: role === 'DISPATCHER' ? new Date() : null,
        applicationStatus:     role === 'DISPATCHER' ? 'PENDING_REVIEW' : 'NOT_APPLIED',

        // Requesters auto-approved, dispatchers need admin approval
        isApproved:       role !== 'DISPATCHER',
        verificationToken,
      },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;


// ✅ NEW - responds immediately, sends email in background
  res.status(201).json({
    status: "success",
    message: "Registration successful! Check your email to verify.",
});

// Send email in background - doesn't block response
  sendEmail({
    email: newUser.email,
    subject: 'Verify your CampusRun Account',
    html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#F97316;">Welcome to CampusRun!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}"
         style="display:inline-block;background:#F97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Verify Email Address
      </a>
    </div>
  `,
}).catch(err => console.error('Verification email failed:', err.message));


} catch (error) {
    console.error("❌ Registration Error MESSAGE:", error.message);
    console.error("❌ Registration Error STACK:", error.stack);
    res.status(500).json({ status: "error", message: error.message });
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
        status:     "error",
        message:    "Verification required.",
        isVerified: false,
      });
    }

    // Check if dispatcher is suspended
    if (user.role === 'DISPATCHER' && user.isSuspended) {
      return res.status(403).json({
        status:   "error",
        message:  `Account suspended until ${user.suspendedUntil?.toLocaleDateString('en-NG')}.`,
      });
    }

    try {
      await prisma.loginRecord.create({
        data: {
          userId:    user.id,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || "127.0.0.1",
          userAgent: req.headers['user-agent'] || "Unknown Device",
        },
      });
    } catch (recordError) {
      console.error("Login record error:", recordError.message);
    }

    return res.json({
      status: "success",
      token:  generateToken(user.id),
      user: {
        id:                user.id,
        fullName:          user.fullName,
        email:             user.email,
        role:              user.role,
        userType:          user.userType,
        matricNumber:      user.matricNumber,
        department:        user.department,
        hostel:            user.hostel,
        college:           user.college,
        isApproved:        user.isApproved,
        applicationStatus: user.applicationStatus,
        isSuspended:       user.isSuspended,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ status: "error", message: "Login failed." });
  }
};

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
        email:     normalizedEmail,
        code:      otpCode,
        expiresAt: new Date(Date.now() + 10 * 60000),
      },
    });

    await sendEmail({
      email:   normalizedEmail,
      subject: 'Your CampusRun Reset Code',
      html: `
        <div style="font-family:sans-serif;text-align:center;padding:24px;">
          <h2>Password Reset</h2>
          <p>Use the code below — expires in 10 minutes:</p>
          <h1 style="color:#F97316;letter-spacing:8px;font-size:48px;">${otpCode}</h1>
        </div>
      `,
    });

    return res.status(200).json({ status: "success", message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot PW Error:", error);
    res.status(500).json({ status: "error", message: "Error sending reset code." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code }  = req.body;
    const normalizedEmail  = email.toLowerCase().trim();
    const cleanCode        = code.trim();

    const otpRecord = await prisma.otp.findFirst({
      where:   { email: normalizedEmail, code: cleanCode },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({
        status:  "error",
        message: "Invalid code. Check your email for the most recent code.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        status:  "error",
        message: "Code expired. Please request a new one.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 15 * 60000),
      },
    });

    await prisma.otp.deleteMany({ where: { email: normalizedEmail } });

    return res.json({ status: "success", resetToken });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ status: "error", message: "Verification failed." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid or expired reset session." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:          await bcrypt.hash(password, 12),
        resetToken:        null,
        resetTokenExpires: null,
      },
    });

    return res.json({ status: "success", message: "Password updated successfully." });
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
      data:  { isVerified: true, verificationToken: null },
    });

    return res.json({ status: "success", message: "Email verified successfully!" });
  } catch {
    res.status(500).json({ status: "error", message: "Verification failed." });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email }       = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ status: "error", message: "Account not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ status: "error", message: "Account already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { email: normalizedEmail },
      data:  { verificationToken },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      email:   normalizedEmail,
      subject: 'Verify your CampusRun Account',
      html:    `<p>Click here to verify your account:</p><a href="${verificationUrl}">Verify Email</a>`,
    });

    return res.json({ status: "success", message: "Verification email resent." });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to resend email." });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: {
        id:                true,
        email:             true,
        fullName:          true,
        role:              true,
        userType:          true,
        matricNumber:      true,
        isVerified:        true,
        isApproved:        true,
        createdAt:         true,
        department:        true,
        hostel:            true,
        college:           true,
        idCardUrl:         true,
        selfieUrl:         true,
        reasonToJoin:      true,  // ← correct field name
        applicationStatus: true,
        isSuspended:       true,
        weeklyBalance:     true,
        totalEarned:       true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.json({ status: "success", user });
  } catch {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};