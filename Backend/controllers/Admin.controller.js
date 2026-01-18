import User from "../models/User.model.js";
import Driver from "../models/Driver.model.js";
import Bus from "../models/Bus.model.js";
import Payment from "../models/Payment.model.js";
import mongoose from "mongoose";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message
    });
  }
};

// Get all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const drivers = await Driver.find({})
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Driver.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        drivers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDrivers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error getting drivers:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving drivers",
      error: error.message
    });
  }
};

// Get all buses
export const getAllBuses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const buses = await Bus.find({})
      .populate('driver', 'name email')
      .populate('location', 'lat lng')
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bus.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        buses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBuses: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error getting buses:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving buses",
      error: error.message
    });
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalBuses,
      totalPayments,
      todayPayments,
      monthlyEarnings
    ] = await Promise.all([
      User.countDocuments(),
      Driver.countDocuments(),
      Bus.countDocuments(),
      Payment.countDocuments(),
      Payment.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        },
        paymentStatus: "Success"
      }),
      Payment.aggregate([
        {
          $match: {
            paymentStatus: "Success",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$ticketPrice" }
          }
        }
      ])
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalDrivers: totalDrivers || 0,
      totalBuses: totalBuses || 0,
      totalPayments: totalPayments || 0,
      todaySuccessfulPayments: todayPayments || 0,
      monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0].totalEarnings || 0 : 0,
      totalEarnings: await Payment.aggregate([
        {
          $match: { paymentStatus: "Success" }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$ticketPrice" }
          }
        }
      ]).then(result => result.length > 0 ? result[0].totalEarnings || 0 : 0)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving admin statistics",
      error: error.message
    });
  }
};

// Get driver statistics (how many buses created, etc.)
export const getDriverStats = async (req, res) => {
  try {
    const drivers = await Driver.aggregate([
      {
        $lookup: {
          from: "buses",
          localField: "_id",
          foreignField: "driver",
          as: "buses"
        }
      },
      {
        $addFields: {
          totalBuses: { $size: "$buses" },
          activeBuses: {
            $size: {
              $filter: {
                input: "$buses",
                cond: { $ne: ["$$this.status", "Inactive"] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          licenceId: 1,
          totalBuses: 1,
          activeBuses: 1,
          lastUpdated: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error("Error getting driver stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving driver statistics",
      error: error.message
    });
  }
};

// Get user trip statistics (how many trips each user took)
export const getUserTripStats = async (req, res) => {
  try {
    const userTripStats = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "Success"
        }
      },
      {
        $group: {
          _id: "$user",
          tripCount: { $sum: 1 },
          totalSpent: { $sum: "$ticketPrice" },
          avgTicketPrice: { $avg: "$ticketPrice" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userData"
        }
      },
      {
        $unwind: "$userData"
      },
      {
        $project: {
          _id: 1,
          userName: "$userData.name",
          userEmail: "$userData.email",
          tripCount: 1,
          totalSpent: 1,
          avgTicketPrice: 1
        }
      },
      {
        $sort: { tripCount: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: userTripStats
    });
  } catch (error) {
    console.error("Error getting user trip stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user trip statistics",
      error: error.message
    });
  }
};

// Get daily statistics
export const getDailyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const dailyStats = await Payment.aggregate([
      {
        $match: {
          paymentStatus: "Success",
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalEarnings: { $sum: "$ticketPrice" },
          totalTickets: { $sum: 1 },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $addFields: {
          uniqueUsersCount: { $size: "$uniqueUsers" }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          totalEarnings: 1,
          totalTickets: 1,
          uniqueUsersCount: 1
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    console.error("Error getting daily stats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving daily statistics",
      error: error.message
    });
  }
};

// Update user status (admin can promote/demote users)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const validStatuses = ['user', 'admin'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses: user, admin"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User status updated successfully"
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message
    });
  }
};

// Update driver status
export const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses: active, inactive"
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { status },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
      message: "Driver status updated successfully"
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating driver status",
      error: error.message
    });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || 'all';
    const skip = (page - 1) * limit;

    let query = {};
    if (filter !== 'all') {
      if (filter === 'success') {
        query.paymentStatus = 'Success';
      } else if (filter === 'failed') {
        query.paymentStatus = 'Failed';
      } else if (filter === 'pending') {
        query.paymentStatus = 'Pending';
      }
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error getting payments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving payments",
      error: error.message
    });
  }
};