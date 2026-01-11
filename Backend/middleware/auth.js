import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import User from "../models/User.model.js";


/* ===========================
   AUTHENTICATIONcl
=========================== */
export const isAuthenticated = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://dev-po1r5cykjnu8e0ld.us.auth0.com/.well-known/jwks.json`,
  }),
  audience: "http://localhost:5000/api/v3",
  issuer: `https://dev-po1r5cykjnu8e0ld.us.auth0.com/`,
  algorithms: ["RS256"],
});

/* ===========================
   ATTACH USER
=========================== */
export const attachUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.sub;
    if (!auth0Id) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(403).json({ message: "User not registered" });

    if (user.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Auth error" });
  }
};

/* ===========================
   ROLE CHECK
=========================== */
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
