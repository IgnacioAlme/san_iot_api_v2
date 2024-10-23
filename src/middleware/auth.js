const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No se encontró token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Prohibido' });
      }

      const userRoles = req.user.roles;
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ message: 'Permisos insuficientes' });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { verifyToken, hasRole };