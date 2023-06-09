require("dotenv").config();
const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const Car = require("../../models/car");

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
          "ClientTokenSecret",
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
        console.log(users,'this is users');
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
        { $set: { userVerify: false } },
        { new: true }
      );
      
      res.status(200).json(blockedUser);
    } else {
      console.log("this is active");
      const activedUser = await user.findOneAndUpdate(
        { _id: id },
        { $set: { userVerify: true } },
        { new: true }
      );
      console.log(activedUser);
      res.status(200).json(activedUser);
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
        { isverify: true },
        { new: true }
      );
      res.status(200).json(verifyDriver);
    } else {
      const rejectedDriver = await user.findOneAndUpdate(
        { _id: id },
        { isverify: false }
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
    res.status(200).json(carsFound)
    
  } catch (error) {
    console.log(error.message);
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
};
