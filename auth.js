// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('./models/resisterStudentModel'); // Adjust the path as needed

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: 'Authentication token is required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    
    if (!req.user) {
      throw new Error();
    }

    next();
  } catch (err) {
    res.status(401).send({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
