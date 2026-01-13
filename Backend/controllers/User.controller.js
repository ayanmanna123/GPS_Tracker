import User from "../models/User.model.js";

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
