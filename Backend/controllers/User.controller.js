import User from "../models/User.model.js";

/**
 * Creates a new user in the database
 * @param {Object} req - Express request object containing user data
 * @param {Object} req.auth - Authentication object with user ID from Auth0
 * @param {string} req.auth.sub - Auth0 user ID
 * @param {Object} req.body - Request body containing user registration data
 * @param {string} req.body.fullname - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.picture - User's profile picture URL
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user creation result
 * @throws {Error} Logs error to console if user creation fails
 */
export const createUser = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture } = req.body;

    if (!fullname || !email || !picture) {
      return res.status(400).json({
        message: "all find is required",
        success: false,
      });
    }

    const newUser = {
      auth0Id: userId,
      name: fullname,
      email: email,
      picture: picture,
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
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture } = req.body;

    if (!fullname || !email || !picture) {
      return res.status(400).json({
        message: "all find is required",
        success: false,
      });
    }

    const newUser = {
      auth0Id: userId,
      name: fullname,
      email: email,
      picture: picture,
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
