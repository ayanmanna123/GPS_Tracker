import User from "../models/User.model.js";

export const createUser = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture } = req.body;

    // Sanitize inputs
    const sanitizedFullname = fullname?.trim();
    const sanitizedEmail = email?.trim().toLowerCase();
    const sanitizedPicture = picture?.trim();

    // Check if all fields are provided
    if (!sanitizedFullname || !sanitizedEmail || !sanitizedPicture) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Validate name length
    if (sanitizedFullname.length < 2 || sanitizedFullname.length > 50) {
      return res.status(400).json({
        message: "Name must be between 2 and 50 characters",
        success: false,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    const newUser = {
      auth0Id: userId,
      name: sanitizedFullname,
      email: sanitizedEmail,
      picture: sanitizedPicture,
    };
    const userData = await User.create(newUser);
    return res.status(201).json({
      message: "User created successfully",
      userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
