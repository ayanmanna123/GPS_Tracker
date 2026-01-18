import Bus from "../models/Bus.model.js";
import Driver from "../models/Driver.model.js";
import User from "../models/User.model.js";

/**
 * Creates a new driver profile in the database
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Auth0 authentication object
 * @param {string} req.auth.sub - Auth0 user ID
 * @param {Object} req.body - Request body containing driver data
 * @param {string} req.body.fullname - Driver's full name
 * @param {string} req.body.email - Driver's email address
 * @param {string} req.body.picture - Driver's profile picture URL
 * @param {string} req.body.licenceId - Driver's license ID
 * @param {string} req.body.driverExp - Driver's experience in years
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with driver creation result
 * @throws {Error} If driver creation fails or validation errors occur
 */
export const createDriver = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const { fullname, email, picture, licenceId, driverExp } = req.body;

    if (!fullname || !email || !picture || !licenceId || !driverExp) {
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
      licenceId: licenceId,
      driverExp: driverExp,
      status: "driver",
    };
    const userData = await Driver.create(newUser);
    return res.status(200).json({
      message: "user create success fully",
      userData,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Finds a driver by email address
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.email - Email address to search for
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with driver data or not found message
 * @throws {Error} If database query fails
 */
export const userFindByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const emailfind = await Driver.findOne({ email: email });
    const userfind = await User.findOne({ email: email });
    if (!emailfind && !userfind) {
      return res.status(404).json({
        message: "User does not exist or Profile not created",
        success: false,
      });
    }
    let newUser;
    if (emailfind) {
      newUser = emailfind;
    } else {
      newUser = userfind;
    }
    return res.status(200).json({
      message: `welcom back ${newUser.name} to our website`,
      newUser,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Updates a driver's profile information
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Auth0 authentication object
 * @param {string} req.auth.sub - Auth0 user ID
 * @param {Object} req.body - Request body containing updated driver data
 * @param {string} [req.body.fullname] - Updated full name
 * @param {string} [req.body.licenceId] - Updated license ID
 * @param {string} [req.body.driverExp] - Updated driving experience
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with updated driver data
 * @throws {Error} If driver not found or update fails
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullname, licenceId, driverExp } = req.body;
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    if (fullname) {
      user.name = fullname;
    }
    if (licenceId) {
      user.licenceId = licenceId;
    }
    if (driverExp) {
      user.driverExp = driverExp;
    }
    const newDetails = await user.save();

    return res.status(200).json({
      message: "user update successfully",
      newDetails,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Creates a new bus associated with the authenticated driver
 * @param {Object} req - Express request object
 * @param {Object} req.auth - Auth0 authentication object
 * @param {string} req.auth.sub - Auth0 user ID of the driver
 * @param {Object} req.body - Request body containing bus data
 * @param {string} req.body.name - Bus name
 * @param {string} req.body.deviceID - Unique device identifier
 * @param {string} req.body.to - Destination location
 * @param {string} req.body.from - Starting location
 * @param {Array} req.body.timeSlots - Array of time slot objects
 * @param {number} req.body.ticketPrice - Price per ticket
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with bus creation result
 * @throws {Error} If bus creation fails or driver not found
 */
export const DriverCreateBus = async (req, res) => {
  try {
    const userId = req.auth.sub;
    let user = await Driver.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "login first",
        success: false,
      });
    }
    const AllBus = await Bus.find({ driver: user._id }).populate([
      { path: "driver" },
      { path: "location" },
    ]);

    if (!AllBus) {
      return res.status(200).json({
        message: "no subject found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "this is your createed Bus",
      AllBus,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
