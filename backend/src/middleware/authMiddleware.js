// import jwt from 'jsonwebtoken';
// import prisma from '../lib/prisma.js';

// /**
//  * PROTECT MIDDLEWARE
//  * Verifies the JWT token and attaches the user to the request object
//  */
// export const protect = async (req, res, next) => {
//   let token;

//   // 1. Check if the Authorization header exists and starts with 'Bearer'
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // 2. Extract the token
//       token = req.headers.authorization.split(' ')[1];

//       // 3. Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // 4. Attach the user to the request (req.user)
//       // FIX: Changed 'fullname' to 'fullName' to match your controller/schema
//       const user = await prisma.user.findUnique({
//         where: { id: decoded.id },
//         select: { 
//           id: true, 
//           fullName: true, // Match your schema!
//           role: true,
//           userType: true, // Added this so you can check if they are STAFF/STUDENT in routes
//           isApproved: true 
//         }
//       });

//       if (!user) {
//         return res.status(401).json({ message: "User no longer exists." });
//       }

//       // Check if the user is approved (especially for Dispatchers later)
//       if (!user.isApproved) {
//         return res.status(403).json({ message: "Your account is pending approval." });
//       }

//       req.user = user;
//       return next(); 

//     } catch (error) {
//       console.error("AUTH_MIDDLEWARE_ERROR:", error.message);
//       return res.status(401).json({ message: "Not authorized, token invalid or expired." });
//     }
//   }

//   // 5. If no token was found at all
//   if (!token) {
//     return res.status(401).json({ message: "No token provided, access denied." });
//   }
// };

// /**
//  * ADMIN ONLY MIDDLEWARE
//  */
// export const adminOnly = (req, res, next) => {
//   if (req.user && req.user.role === 'ADMIN') {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied. Admins only." });
//   }
// };

// BACKEND: middleware/authMiddleware.js
// ✅ protect     — full check: valid token + user exists + isApproved (for non-requesters)
// ✅ protectLite — lighter check: valid token + user exists, skips isApproved
//                  Use for routes where a newly-approved runner needs immediate access

import jwt    from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// ── Full protection ───────────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where:  { id: decoded.id },
        select: {
          id: true, fullName: true, role: true,
          userType: true, isApproved: true, isSuspended: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists.' });
      }

      // REQUESTERs and ADMINs are always approved by default
      // Only DISPATCHERs need explicit isApproved
      if (!user.isApproved && user.role === 'DISPATCHER') {
        return res.status(403).json({ message: 'Your account is pending approval.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('AUTH_MIDDLEWARE_ERROR:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied.' });
  }
};

// ── Light protection — skips isApproved check ─────────────────────────────────
// Use when: a newly-approved runner needs immediate access before
// their client refreshes the token (e.g. viewing available orders)
export const protectLite = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where:  { id: decoded.id },
        select: {
          id: true, fullName: true, role: true,
          userType: true, isApproved: true, isSuspended: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied.' });
  }
};