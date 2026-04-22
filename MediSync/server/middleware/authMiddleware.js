const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // Check karein ke headers mein authorization token majood hai ya nahi
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer eyJhbG..." se sirf token nikalna
      token = req.headers.authorization.split(' ')[1];

      // Token verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // User ki info request mein daal dena taa ke aage use ho sake
      req.user = decoded;
      next(); // Sab theek hai, aage controller ki taraf jane do
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

exports.admin = (req, res, next) => {
  // Check karega ke jo user logged in hai, kya uska role 'Doctor' hai?
  if (req.user && req.user.role === 'Doctor') {
    next(); // Agar Doctor hai, toh aage jane do
  } else {
    res.status(401).json({ message: 'Not authorized as an Admin/Doctor' });
  }
};