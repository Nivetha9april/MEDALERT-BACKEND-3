const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Access Denied" });

  const token = authHeader.split(" ")[1]; // ✅ Extract the actual token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // You can access req.userId in controllers
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};
