import User from "../models/User.model.js";

/**
 * Creates a new user in the database after validating input data
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Auth0 authentication object containing user info
 * @param {string} req.auth.sub - Auth0 user ID
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.fullname - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.picture - User's profile picture URL
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with user creation result
 * @throws {Error} If user creation fails or validation errors occur
 */
export const createUser = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture } = req.body;

    // Sanitize inputs
    const sanitizedFullname = fullname?.trim();
    const sanitizedEmail = email?.trim();
    const sanitizedPicture = picture?.trim();

    if (!sanitizedFullname || !sanitizedEmail || !sanitizedPicture) {
      return res.status(400).json({
        message: "all fields are required",
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
    return res.status(200).json({
      message: "user create success fully",
      userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
