import jwt from 'jsonwebtoken';

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || 'inasumba-jwt-secret-key';

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * Generate JWT token
 * @param {Object} payload - The data to be encoded in the token
 * @returns {string} The JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export default {
  authMiddleware,
  generateToken,
  JWT_SECRET
};
