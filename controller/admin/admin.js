require("dotenv").config();
const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const Car = require("../../models/car");
const booking = require("../../models/Booking");
const Wallet = require("../../models/wallet");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findAdmin = await user.findOne({ email: email });

    if (findAdmin.isAdmin === true && findAdmin) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        findAdmin.password
      );
      if (!isPasswordCorrect) {
        return res.json({ status: "incorrect password" });
      }

      if (findAdmin.isAdmin === true && isPasswordCorrect) {
        const toke = jwt.sign(
          { id: findAdmin._id, role: "admin" },
          "admin_secret",
          { expiresIn: "5h" }
        );
        res
          .status(200)
          .json({ token: toke, admin: findAdmin, status: "Login success" });
      }
    } else {
      res.json({ status: "User doesn't exist" });
    }
  } catch (error) {
    res.json({ status: "something wrong" });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await user.find({ isUser: true });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ status: error.message });
  }
};
const blockUser = async (req, res) => {
  try {
    const { id, blocking } = req.body;
    if (blocking === "active") {
      const blockedUser = await user.findOneAndUpdate(
        { _id: id },
        { $set: { status: false } },
        { new: true }
      );

      res.status(200).json(blockedUser);
    } else {
      console.log("this is active");
      const activedUser = await user.findOneAndUpdate(
        { _id: id },
        { $set: { status: true } },
        { new: true }
      );
      console.log(activedUser);
      res.status(200).json(activedUser);
    }
  } catch (error) {
    console.log(error.message);
  }
};
const blockDrivers = async (req, res) => {
  try {
    const { id, status } = req.body;
    console.log(id, status, "this status");
    if (status === "active") {
      console.log("false");
      const blockedUsers = await user.findOneAndUpdate(
        { _id: id },
        { $set: { DriverStatus: false } },
        { new: true }
      );

      res.status(200).json(blockedUsers);
    } else {
      console.log("true");
      const activedUsers = await user.findOneAndUpdate(
        { _id: id },
        { $set: { DriverStatus: true } },
        { new: true }
      );

      res.status(200).json(activedUsers);
    }
  } catch (error) {
    console.log(error.message);
  }
};
const getDrivers = async (req, res) => {
  try {
    const drivers = await user.find({ isDriver: { $eq: true } });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500);
  }
};
const getDriver = async (req, res) => {
  try {
    const { id } = req.query;
    const driver = await user.findOne({ _id: id });
    res.status(200).json(driver);
  } catch (error) {
    res.status(500);
  }
};
const blockDriver = async (req, res) => {
  try {
    const { status, id } = req.body;
    if (status === "verify") {
      console.log(status);
      const verifyDriver = await user.findOneAndUpdate(
        { _id: id },
        { isverify: "verified" },
        { new: true }
      );
      res.status(200).json(verifyDriver);
    } else {
      const rejectedDriver = await user.findOneAndUpdate(
        { _id: id },
        { isverify: "Rejected" }
      );
      res.status(200).json(rejectedDriver);
    }
  } catch (error) {
    res.status(500);
  }
};
const carList = async (req, res) => {
  try {
    const carsFound = await Car.find({});
    res.status(200).json(carsFound);
  } catch (error) {
    console.log(error.message);
  }
};
const getCar = async (req, res) => {
  try {
    const { id } = req.query;
    const car = await Car.findOne({ _id: id });
    res.status(200).json(car);
  } catch (error) {}
};
const verifyCar = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (status === "verified") {
      const carVerify = await Car.findOneAndUpdate(
        { _id: id },
        { $set: { carVerify: "verified" } },
        { new: true }
      );
      res.status(200).json(carVerify);
    } else {
      const rejectCar = await Car.findOneAndUpdate(
        { _id: id },
        { $set: { carVerify: "Rejected" } },
        { new: true }
      );
      res.status(200).json(rejectCar);
    }
  } catch (error) {
    res.status(500);
  }
};
const tripDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const findtrip = await booking.findOne({ _id: id }).populate("driver");
    res.status(200).json(findtrip);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
};
const findTrip = async (req, res) => {
  try {
    const FindTrips = await booking.find().populate("driver");
    res.status(200).json(FindTrips);
  } catch (error) {
    res.status(500).json(error);
  }
};
const adminReport = async (req, res) => {
  try {
    const { adminid } = req.query;
    const totaltrip = await booking.find().count();
    const completedTrip = await booking
      .find({ ReachedDestination: "confirmed" })
      .count();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const monthlyReport = await booking.aggregate([
      {
        $match: {
          $and: [
            { createdAt: { $gte: startOfMonth, $lte: endOfMonth } },
            { ReachedDestination: "confirmed" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$payment.aduvance" },
        },
      },
    ]);

    const monthlyEarnings = await booking.aggregate([
      {
        $match: {
          ReachedDestination: "confirmed",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
          },
          amount: { $sum: "$payment.aduvance" },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          monthName: {
            $let: {
              vars: {
                monthsInString: [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$_id.month"],
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let monthlyEarning = [];
    let monthName = [];
    monthlyEarnings.forEach((Element) => {
      monthlyEarning.push(Element.amount);
      monthName.push(Element.monthName);
    });
    const rejected = await booking.find({bookingStatus:"rejected" }).count()
    const cancelled = await booking.find({bookingStatus:"Cancelled" }).count()
    const Pending = await booking.find({bookingStatus:'Pending'}).count()
     
    const adminwallet = await Wallet.findOne({ ownerId: adminid });
    res.status(200).json({
        monthlyReport,
        completedTrip,
        totaltrip,
        adminwallet,
        monthName,
        monthlyEarning,
        Pending,
        cancelled,
        rejected
      });
  } catch (error) {
    console.log(error.message);
    res.status(200).json(error);
  }
};

module.exports = {
  login,
  getUsers,
  blockUser,
  getDrivers,
  getDriver,
  blockDriver,
  carList,
  getCar,
  blockDrivers,
  verifyCar,
  tripDetails,
  findTrip,
  adminReport,
};
