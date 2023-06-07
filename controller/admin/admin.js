require("dotenv").config();
const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");

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
         res.status(200).json({ token: toke, admin: findAdmin, status: "Login success" });
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
    const users = await user.find({
      $or:[{isAdmin: { $ne: true }},
        {isDriver: { $ne: true }}]
    });
     
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
const getDriver = async (req, res) => {
  const driver = await user.find({isDriver:{$eq:true}})
  console.log(driver,'this  is driver');
}

module.exports = {
  login,
  getUsers,
  blockUser,
  getDriver
};
