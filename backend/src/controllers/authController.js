import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const register = async (req, res) => {
  try {
    console.log(
      '🚀 Register hit — body keys:',
      Object.keys(req.body || {})
    );
    console.log('Data received:', req.body);

    console.log(
      'Files received:',
      JSON.stringify(Object.keys(req.files || {}))
    );

    const {
      email,
      password,
      fullname,
      role,
      userType,
      matricNumber,
      department,
      hostel,
      college,
      staffId,
      reasonToJoin,
    } = req.body;

    const idCardUrl = req.files?.idCard?.[0]?.path ?? null;
    const selfieUrl = req.files?.selfie?.[0]?.path ?? null;

    if (!email || !password || !fullname) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields missing.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMatric = matricNumber?.trim().toUpperCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered.',
      });
    }

    if (role === 'DISPATCHER' && (!idCardUrl || !selfieUrl)) {
      return res.status(400).json({
        status: 'error',
        message: 'Dispatchers must upload an ID card and a selfie.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto
      .randomBytes(32)
      .toString('hex');

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName: fullname,
        role: role || 'REQUESTER',
        userType: userType || 'STUDENT',

        matricNumber:
          userType === 'STUDENT' || role === 'DISPATCHER'
            ? normalizedMatric
            : null,

        department: department || null,

        hostel:
          userType === 'STUDENT'
            ? hostel || null
            : null,

        college:
          userType === 'STUDENT'
            ? college || null
            : null,

        staffIdUsername:
          userType === 'STAFF'
            ? staffId || null
            : null,

        idCardUrl,
        selfieUrl,

        reasonToJoin:
          role === 'DISPATCHER'
            ? reasonToJoin || null
            : null,

        applicationSubmittedAt:
          role === 'DISPATCHER'
            ? new Date()
            : null,

        applicationStatus:
          role === 'DISPATCHER'
            ? 'PENDING_REVIEW'
            : 'NOT_APPLIED',

        isApproved: role !== 'DISPATCHER',

        verificationToken,
      },
    });

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      'https://campusrun-4t0d.onrender.com'
    ).replace(/\/$/, '');

    const verificationUrl =
      `${frontendUrl}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Verify your CampusRun Account',
        html: 
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#FF6B00;">
              Welcome to CampusRun! 🚀
            </h2>

            <p>
              Hi ${newUser.fullName},
            </p>

            <p>
              Thank you for creating your CampusRun account.
              Please verify your email address by clicking the button below.
            </p>

            <div style="text-align:center;margin:30px 0;">
              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  background:#FF6B00;
                  color:#ffffff;
                  padding:14px 28px;
                  border-radius:8px;
                  text-decoration:none;
                  font-weight:bold;
                "
              >
                Verify Email Address
              </a>
            </div>

            <p>
              If you did not create this account, you can safely ignore this email.
            </p>

            <p>
              — CampusRun Team
            </p>
          </div>
        ,
      });
    } catch (emailError) {
      console.error(
        '❌ Verification email failed:',
        emailError.message
      );
    }

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful! Check your email to verify.',
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Registration failed.',
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found.',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Verification required.',
        isVerified: false,
      });
    }

    if (user.role === 'DISPATCHER' && user.isSuspended) {
      return res.status(403).json({
        status: 'error',
        message: `Account suspended until ${user.suspendedUntil?.toLocaleDateString(
          'en-NG'
        )}.`,
      });
    }

    try {
      await prisma.loginRecord.create({
        data: {
          userId: user.id,
          ipAddress:
            req.ip ||
            req.headers['x-forwarded-for'] ||
            '127.0.0.1',
          userAgent:
            req.headers['user-agent'] ||
            'Unknown Device',
        },
      });
    } catch (recordError) {
      console.error(
        'Login record error:',
        recordError.message
      );
    }

    return res.json({
      status: 'success',
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
        isApproved: user.isApproved,
        applicationStatus: user.applicationStatus,
        isSuspended: user.isSuspended,
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Login failed.',
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Email not registered.',
      });
    }

    await prisma.otp.deleteMany({
      where: {
        email: normalizedEmail,
      },
    });

    const otpCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();

    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt: new Date(
          Date.now() + 10 * 60000
        ),
      },
    });

    await sendEmail({
      email: normalizedEmail,
      subject: 'Your CampusRun Reset Code',
      html: 
        <div style="font-family:Arial,sans-serif;text-align:center;padding:30px;">
          <h2 style="color:#FF6B00;">
            Password Reset
          </h2>

          <p>
            Use the verification code below to reset your CampusRun password.
          </p>

          <h1
            style="
              color:#FF6B00;
              letter-spacing:8px;
              font-size:48px;
              margin:30px 0;
            "
          >
            ${otpCode}
          </h1>

          <p>
            This code expires in <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, you can ignore this email.
          </p>
        </div>
      ,
    });

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent to your email.',
    });

  } catch (error) {
    console.error('❌ Forgot PW Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Error sending reset code.',
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and code are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: cleanCode,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        status: 'error',
        message:
          'Invalid code. Check your email for the most recent code.',
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        status: 'error',
        message:
          'Code expired. Please request a new one.',
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        resetToken,
        resetTokenExpires: new Date(
          Date.now() + 15 * 60000
        ),
      },
    });

    await prisma.otp.deleteMany({
      where: {
        email: normalizedEmail,
      },
    });

    return res.json({
      status: 'success',
      resetToken,
    });

  } catch (error) {
    console.error('❌ Verify OTP Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Verification failed.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        status: 'error',
        message:
          'Reset token and password are required.',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message:
          'Invalid or expired reset session.',
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return res.json({
      status: 'success',
      message: 'Password updated successfully.',
    });

  } catch (error) {
    console.error('❌ Reset Password Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Reset failed.',
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message:
          'Invalid or expired verification link.',
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return res.json({
      status: 'success',
      message: 'Email verified successfully!',
    });

  } catch (error) {
    console.error(
      '❌ Email Verification Error:',
      error
    );

    return res.status(500).json({
      status: 'error',
      message: 'Verification failed.',
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Account not found.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Account already verified.',
      });
    }

    const verificationToken = crypto
      .randomBytes(32)
      .toString('hex');

    await prisma.user.update({
      where: {
        email: normalizedEmail,
      },
      data: {
        verificationToken,
      },
    });

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      'https://campusrun-4t0d.onrender.com'
    ).replace(/\/$/, '');

    const verificationUrl =
      `${frontendUrl}/verify-email/${verificationToken}`;

    await sendEmail({
      email: normalizedEmail,
      subject: 'Verify your CampusRun Account',
      html: 
        <div style="font-family:Arial,sans-serif;text-align:center;padding:30px;">
          <h2 style="color:#FF6B00;">
            Verify your CampusRun Account
          </h2>

          <p>
            Click the button below to verify your email address.
          </p>

          <div style="margin:30px 0;">
            <a
              href="${verificationUrl}"
              style="
                display:inline-block;
                background:#FF6B00;
                color:white;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
              "
            >
              Verify Email
            </a>
          </div>
        </div>
      ,
    });

    return res.json({
      status: 'success',
      message: 'Verification email resent.',
    });

  } catch (error) {
    console.error(
      '❌ Resend Verification Error:',
      error
    );

    return res.status(500).json({
      status: 'error',
      message: 'Failed to resend email.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        userType: true,
        matricNumber: true,
        isVerified: true,
        isApproved: true,
        createdAt: true,
        department: true,
        hostel: true,
        college: true,
        idCardUrl: true,
        selfieUrl: true,
        reasonToJoin: true,
        applicationStatus: true,
        isSuspended: true,
        weeklyBalance: true,
        totalEarned: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.json({
      status: 'success',
      user,
    });

  } catch (error) {
    console.error('❌ Get Me Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};