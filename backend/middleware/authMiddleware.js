const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not explicitly set in environment variables! Using default secret in non-production environment.');
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required. Please sign in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedCity: true,
        coveredPostcodes: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User session invalid or deleted.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }
}

async function optionalAuthenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          assignedCity: true,
          coveredPostcodes: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (err) {
    // Soft ignore for optional token check
  }
  next();
}

async function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Super Administrators can perform this action.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  requireSuperAdmin,
  JWT_SECRET,
};
