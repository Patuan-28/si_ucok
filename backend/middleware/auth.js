const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const token = bearerHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token format is incorrect' });
  }

  jwt.verify(token, 'A_VERY_SECRET_KEY', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };
