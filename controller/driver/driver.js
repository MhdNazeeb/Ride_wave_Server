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
    const findcar = await Car.findOne({
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
    const findEmail = await user.findOne({ email: data.email });
    if (findEmail) {
      return res.status(200).json({ message: "email already registered" });
    }

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

    let findUser = await user.findOne({ _id: data });
    const findCar = await Car.findOne({ userId: findUser._id });

    findCar
      ? (findUser = { ...findUser, IsCar: true })
      : (findUser = { ...findUser, IsCar: false });

    res.status(200).json(findUser);
  } catch (error) {
    res.status(500);
  }
};
const getCar = async (req, res) => {
  try {
    const { driverid } = req.query;
    const findCar = await Car.findOne({ userId: driverid });
    console.log(findCar, "this findCar");
    res.status(200).json(findCar);
  } catch (error) {
    res.status(500);
  }
};
const editCar = async (req, res) => {
  try {
    const {
      model,
      year,
      RegistrationNumber,
      Features,
      Rate,
      image,
      driverid,
      carimage,
    } = req.body;
    if (carimage.length === 0) {
      const UpdateCar = await Car.findOneAndUpdate(
        { userId: driverid },
        {
          model: model,
          year: year,
          RegistrationNumber: RegistrationNumber,
          Features: Features,
          Rate: Rate,
          carimage: image,
          userId: driverid,
        }
      );
      res.status(200).json({ message: "updated successfully" });
    } else {
      const file = await cloudinary.uploader.upload(carimage, {
        folder: "carImage",
      });
      const UpdateCarOne = await Car.findOneAndUpdate(
        { userId: driverid },
        {
          model: model,
          year: year,
          RegistrationNumber: RegistrationNumber,
          Features: Features,
          Rate: Rate,
          carimage: file.secure_url,
          userId: driverid,
        }
      );
      res.status(200).json({ message: "updated successfully" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};
const driverLocation = async (req, res) => {
  try {
    const { driverCoordinates, driverid, active } = req.body;
    console.log(active, "this active");
    if (active === true) {
      const updateLocation = await Car.findOneAndUpdate(
        { userId: driverid },
        { $set: { LocationStatus: "on", location: driverCoordinates } },
        { new: true }
      );
      res.status(200).json({ message: "Your location on" });
    } else {
      const updateLocation = await Car.findOneAndUpdate(
        { userId: driverid },
        { $set: { LocationStatus: "of", location: driverCoordinates } },
        { new: true }
      );
      res.status(200).json({ message: "Location of" });
    }
  } catch (error) {
    res.status(500);
    console.log(error.message, "this message");
  }
};
const car = async (req, res) => {
  try {
    const { driverid } = req.query;
    const findcar = await Car.findOne({ userId: driverid });
    res.status(200).json(findcar)
    res.status(200);
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
  editCar,
  driverLocation,
  car,
};
