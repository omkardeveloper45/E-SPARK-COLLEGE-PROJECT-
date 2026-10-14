const { verifyToken } = require('../utils/jwt');

const protectUser = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

const protectAdmin = (req, res, next) => {
  protectUser(req, res, () => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Super Admin' || req.user.isAdmin)) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
  });
};

module.exports = {
  protectUser,
  protectAdmin
};
