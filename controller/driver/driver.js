require("dotenv").config();
const bcrypt = require("bcrypt");
const cloudinary = require("../../utils/Cloudinary");
const user = require("../../models/user");
const Car = require("../../models/car");
const jwt = require("jsonwebtoken");
const { query } = require("express");

const signup = async (req, res) => {
  try {
    const { fname, password, cpassword, email, license } = req.body;
    const findUser = await user.findOne({ email: email });
    console.log(findUser, "this find user");
    if (findUser && findUser.isDriver) {
      console.log("this user");
      return res.json({ message: "email is all ready registred" });
    }
    if (password && cpassword) {
      const hashedpassword = await bcrypt.hash(password, 10);

      const hashedconfirmpassword = await bcrypt.hash(cpassword, 10);
      console.log("this password checking");
      const file = await cloudinary.uploader.upload(license, {
        folder: "DriverLicense",
      });
      if (findUser && !findUser.isDriver) {
        console.log("this user");
        await user.findOneAndUpdate(
          { email: email },
          {
            name: fname,
            password: hashedpassword,
            confirm_password: hashedconfirmpassword,
            license: file.secure_url,
            isDriver: true,
            DriverStatus: true,
          }
        );
        return res.json({ message: "new account created sucessfully" });
      }

      await user
        .create({
          name: fname,
          email: email,
          password: hashedpassword,
          confirm_password: hashedconfirmpassword,
          license: file.secure_url,
          isDriver: true,
          DriverStatus: true,
        })
        .then(() => {
          res.status(200).json({ message: "new account created sucessfully" });
        })
        .catch((error) => {
          console.log(error.message, "server erro");
          res.json({ message: "something wrong" });
        });
    }
  } catch (error) {
    console.log(error.message, "this server error");
    res.status(500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findDriver = await user.findOne({ email: email, isDriver: true });
    if (!findDriver) return res.json({ status: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      findDriver.password
    );
    console.log(isPasswordCorrect, "password");
    if (!isPasswordCorrect) {
      return res.json({ status: "incorrect password" });
    }
    if (findDriver.isverify === "Rejected") {
      await user.deleteOne(findDriver._id);
      return res.json({
        status:
          "We regret to inform you that your account verification request has been rejected",
      });
    }
    if (findDriver.isverify === "verified" && isPasswordCorrect) {
      if (findDriver.DriverStatus) {
        const toke = jwt.sign(
          { id: findDriver._id, role: "driver" },
          "DriverTokenSecret",
          { expiresIn: "5h" }
        );
        res
          .status(200)
          .json({ token: toke, driver: findDriver, status: "Login success" });
      } else {
        return res.status(200).json({ status: "your account has been banned" });
      }
    } else {
      return res
        .status(200)
        .json({ status: "it may take 24 houres to verify driver" });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ status: "something wrong" });
  }
};
const carRegister = async (req, res) => {
  try {
    console.log("this is rejister car");
    const {
      model,
      year,
      RegistrationNumber,
      Features,
      Carimage,
      Rate,
      driverid,
    } = req.body;
    const findCar = await Car.findOne({ userId: driverid });
    if (findCar)
      return res
        .status(200)
        .json({ message: "this account has allready registerd" });
    const findcarno = await Car.findOne({
      RegistrationNumber: RegistrationNumber,
    });
    if (!findcar) {
      const file = await cloudinary.uploader.upload(Carimage, {
        folder: "carImage",
      });
      const car = await Car.create({
        model: model,
        year: year,
        RegistrationNumber: RegistrationNumber,
        Features: Features,
        Rate: Rate,
        carimage: file.secure_url,
        userId: req.user.id,
      });
      console.log(car, "this is your car");
      res
        .status(200)
        .json({ message: "it  may take 24 houres to verify your car" });
    } else {
      res.status(200).json({ message: "Registration number allready exists" });
    }
  } catch (error) {
    res.status(500).json({ message: "something  wrong" });
    console.log(error.message);
  }
};
const profile = async (req, res) => {
  try {
    const { data } = req.body;
    console.log(data, "thiis is data");
    const findDriver = await user.findOneAndUpdate(
      { _id: data.driverid },
      {
        $set: {
          email: data.email,
          name: data.name,
        },
      },
      { new: true }
    );
    console.log(findDriver, "this is new drivr");
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error.message, "this eroorrrrr");
  }
};
const getProfile = async (req, res) => {
  try {
    const { data } = req.query;
    const findUser = await user.findOne({ _id: data });
    res.status(200).json(findUser);
  } catch (error) {
    res.status(500);
  }
};
const getCar = async (req, res) => {
  try {
    const { driverid } = req.query;
    const findCar = await Car.findOne({ userId: driverid });
    console.log(findCar,'this user car');
    res.status(200).json(findCar);
  } catch (error) {
    res.status(500);
  }
};

module.exports = {
  signup,
  login,
  carRegister,
  profile,
  getProfile,
  getCar,
};
