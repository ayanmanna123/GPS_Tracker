import User from "../models/User.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.sub;

    if (!auth0Id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No authentication token provided",
      });
    }

    const user = await User.findOne({ auth0Id: auth0Id });

    if (!user || user.status !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error in admin verification",
    });
  }
};

export default isAdmin;
