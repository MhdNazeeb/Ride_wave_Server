require("dotenv").config();
const bcrypt = require("bcrypt");
const cloudinary = require("../../utils/Cloudinary");
const user = require("../../models/user");
const Car = require("../../models/car");
const booking = require("../../models/Booking");
const jwt = require("jsonwebtoken");
const wallet = require("../../models/Wallet");
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
        const updatedDriver = await user.findOneAndUpdate(
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
        const findWallet = await wallet.findOne({ _id: updatedDriver._id });
        if (!findWallet) {
          await wallet.create({
            ownerId: updatedDriver._id,
          });
        }
        return res.json({ message: "new account created sucessfully" });
      }

      const driverData = await user.create({
        name: fname,
        email: email,
        password: hashedpassword,
        confirm_password: hashedconfirmpassword,
        license: file.secure_url,
        isDriver: true,
        DriverStatus: true,
      });
      const findWallet = await wallet.findOne({ _id: driverData._id });
      if (!findWallet) {
        await wallet.create({
          ownerId: driverData._id,
        });
      }
      return res
        .status(200)
        .json({ message: "new account created sucessfully" });
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
    res.status(200).json(findcar);
    res.status(200);
  } catch (error) {
    res.status(500);
  }
};
const availableRide = async (req, res) => {
  try {
    const { driverid } = req.query;
    const findTrip = await booking
      .find({ driver: driverid })
      .populate("passenger")
      .sort({ _id: -1 });
    res.status(200).json(findTrip);
  } catch (error) {}
};
const rjectRide = async (req, res) => {
  try {
    const { tripid, driverid, status } = req.body;
    if (status === "reject") {
      const currentDate = new Date().toJSON().slice(0, 10);
      const updateStatus = await booking
        .findOneAndUpdate(
          { _id: tripid },
          { $set: { bookingStatus: "rejected" } },
          { new: true }
        )
        .populate("passenger");
      const updatedcar = await Car.updateOne(
        { userId: driverid },
        { $set: { RideStatus: "not booked" } }
      );

      const aduvance = updateStatus.payment.aduvance;

      const passengerid = updateStatus.passenger;
      const findAmin = await user.findOne({ isAdmin: true });
      const walletUpdate = await wallet.findOneAndUpdate(
        { ownerId: passengerid },
        {
          $inc: { currentBalance: aduvance },
          $push: {
            transactions: {
              payee: findAmin._id,
              amount: aduvance,
              recever: passengerid,
              Date: currentDate,
              Status: true,
            },
          },
        },

        { new: true }
      );
      const adminwalllet = await wallet.findOneAndUpdate(
        { ownerId: findAmin._id },
        {
          $inc: { currentBalance: -aduvance },
          $push: {
            transactions: {
              payee: findAmin._id,
              amount: aduvance,
              recever: passengerid,
              Date: currentDate,
              Status: true,
            },
          },
        },

        { new: true }
      );

      res.status(201).json({ updateStatus, message: "rejected" });
    } else {
      const updateStatus = await booking
        .findOneAndUpdate(
          { _id: tripid },
          { $set: { bookingStatus: "confirmed", Reachedpickup: "way" } },
          { new: true }
        )
        .populate("passenger");
      res.status(200).json({ updateStatus, message: "confirmed" });
    }
  } catch (error) {
    console.log(error.message, "error");
    res.status(500);
  }
};
const getTrip = async (req, res) => {
  try {
    const { driverid } = req.query;
    const findTrip = await booking
      .findOne({ driver: driverid, bookingStatus: "Pending" })
      .populate("passenger");

    res.status(200).json(findTrip);
  } catch (error) {
    res.status(500);
  }
};
const findTrip = async (req, res) => {
  try {
    const { tripid } = req.query;

    const findtrip = await booking
      .findOne({ _id: tripid })
      .populate("passenger");
    res.status(200).json(findtrip);
  } catch (error) {
    res.status(500);
  }
};

const destination  = async (req,res)=>{
  try {
    const {tripid,otp} =req.body
    const confirmOtp=await booking.findOne({verficationCode:otp})
    if(!confirmOtp){
      return res.status(200).json({message:"otp incorrect"})
    }else{
      await booking.updateOne({_id:tripid},{$set:{StartedToDestination:'confirmed',Reachedpickup:'confirmed'}})
      res.status(200).json({message:"otp successful"})
    }
  
  } catch (error) {
    console.log(error.message);
    res.status(500)
  }
}
const tripComleted = async (req,res)=>{
  try {
    const {tripid}=req.body

   const finddriver = await booking.findOneAndUpdate({_id:tripid},{$set:{ReachedDestination:'confirmed'}},{new:true})
   console.log(finddriver,'this is driver');
    await Car.updateOne({userId:finddriver.driver},{$set:{RideStatus:'not booked'}})
     res.status(200).json({message:'Ride completed'})
  } catch (error) {
    console.log(error.message);
    res.status(500)
  }
}

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
  availableRide,
  rjectRide,
  getTrip,
  findTrip,
  destination,
  tripComleted
};
