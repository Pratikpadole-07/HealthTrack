const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.header("x-auth-token");

  if (!token) {
    const authHeader = req.header("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.user || !decoded.user.id || !decoded.user.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id: decoded.user.id,
      role: decoded.user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
