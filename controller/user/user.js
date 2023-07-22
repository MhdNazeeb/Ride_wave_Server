const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Car = require("../../models/car");
const nodemailer = require("nodemailer");
const { token } = require("morgan");
const jwt_decode = require("jwt-decode");
const booking = require("../../models/Booking");
const wallet = require("../../models/Wallet");
const { log } = require("console");
const signup = async (req, res) => {
  try {
    const { fname, password, cpassword, email } = req.body;
    const samemail = await user.findOne({ email: email });
    if (samemail && samemail.isUser) {
      return res.json({ message: "email all ready registered" });
    }
    if (password && cpassword) {
      const hashedpassword = await bcrypt.hash(password, 10);
      const hashedconfirmpassword = await bcrypt.hash(cpassword, 10);

      if (samemail && !samemail.isUser) {
        const updatedData = await user.findOneAndUpdate(
          { email: email },
          {
            name: fname,
            isUser: true,
            password: hashedpassword,
            confirm_password: hashedconfirmpassword,
          },
          {
            new: true,
          }
        );
        const findWallet = await wallet.findOne({ _id: updatedData._id });
        if (!findWallet) {
          await wallet.create({
            ownerId: updatedData._id,
          });
        }
        return res
          .status(200)
          .json({ message: "new account created sucessfully" });
      }
      const userdata = await user.create({
        name: fname,
        email: email,
        isUser: true,
        EmailToken: crypto.randomBytes(64).toString("hex"),
        password: hashedpassword,
        confirm_password: hashedconfirmpassword,
      });
      const findWallet = await wallet.findOne({ _id: userdata._id });
      if (!findWallet) {
        await wallet.create({
          ownerId: userdata._id,
        });
      }
      return res
        .status(200)
        .json({ message: "new account created sucessfully" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};
const login = async (req, res) => {
  try {
    let { email, password, google, id } = req.body;

    if (google) {
      const decoded = jwt_decode(id);
      console.log(decoded, "decoded");
      email = decoded.email;
    }

    const findUser = await user.findOne({ email: email, isUser: true });
    if (!findUser) {
      console.log("this is null");
      return res.json({ status: "User doesn't exist" });
    }
    if (findUser && google) {
      const toke = jwt.sign(
        { id: findUser._id, role: "user" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );
      return res
        .status(200)
        .json({ token: toke, user: findUser, status: "Login success" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
    console.log(isPasswordCorrect, "password");
    if (!isPasswordCorrect) {
      return res.json({ status: "incorrect password" });
    }
    if (findUser.status === true && isPasswordCorrect) {
      const toke = jwt.sign(
        { id: findUser._id, role: "user" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );
      if (!findUser.userVerify) {
        sendEmail(findUser, res);
        return;
      }
      res
        .status(200)
        .json({ token: toke, user: findUser, status: "Login success" });
    } else {
      res.status(200).json({ message: "your account has been banned" });
    }
  } catch (error) {
    console.log(error.message, "message");
    res.status(500).json({ status: "something wrong" });
  }
};

const sendEmail = async (finduser, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "naseebn819@gmail.com",
      pass: "ouwwqtdfjbciesnc",
    },
  });

  const mailOptions = {
    from: "naseebn819@gmail.com",
    to: finduser.email,
    subject: "RiDEWAVE",
    html: `<div>
      <h1>Your verification link here!</h1>
      <p> http://localhost:3000/enterPassword/${finduser._id}</p>
      <p>------------------------------</p>
    </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error");
      res.status(404).json({ status: error.message });
    } else {
      console.log("email send  suuccessfulllly");
      res.status(200).json({
        message: "not verified",
        status: `verification link has been send to ${info.accepted[0]}`,
      });
    }
  });
};

const verifyLink = async (req, res) => {
  try {
    const { userid } = req.query;
    console.log(userid);
    const isverifyuser = await user.findByIdAndUpdate(
      { _id: userid },
      { $set: { userVerify: true } },
      { new: true }
    );
    const toke = jwt.sign(
      { id: isverifyuser._id, role: "user" },
      "ClientTokenSecret",
      { expiresIn: "5h" }
    );
    res.status(200).json({
      token: toke,
      user: isverifyuser,
      status: "Account has been verified successfully",
    });
  } catch (error) {
    console.log(error.message);
  }
};
const carList = async (req, res) => {
  try {
    const findCar = await Car.find({
      LocationStatus: "on",
      RideStatus: "not booked",
      carVerify: "verified",
    }).populate("userId");
    console.log(findCar, "this find car");
    res.status(200).json(findCar);
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};
const bookCar = async (req, res) => {
  try {
    const currentDate = new Date().toJSON().slice(0, 10);
    const { pickup, dropOff, driver, distance, userid, rate, Rate } = req.body;

    const findCar = await Car.findOne({ userId: driver, RideStatus: "booked" });
    if (findCar) {
      return res.status(200).json({ message: "car is not available" });
    }

    const otp = Math.floor(500000 + Math.random() * 5000000);
    const bookingRide = await booking.create({
      driver: driver,
      location: {
        pickup: pickup,
        dropoff: dropOff,
        distance: distance,
      },
      verficationCode: otp,
      passenger: userid,
      payment: {
        amount: Rate,
        aduvance: rate,
      },
    });
    let findBooking = await booking
      .findOne({ _id: bookingRide._id })
      .populate("driver");
    const findAmin = await user.findOne({ isAdmin: true });
    const walletUpdate = await wallet.findOneAndUpdate(
      { ownerId: findAmin._id },
      {
        $inc: { currentBalance: rate },
        $push: {
          transactions: {
            payee: userid,
            amount: rate,
            recever: findAmin._id,
            Date: currentDate,
            Status: true,
          },
        },
      }
    );
    await wallet.findOneAndUpdate(
      { ownerId: userid },
      {
        $push: {
          transactions: {
            payee: userid,
            amount: rate,
            recever: findAmin._id,
            Date: currentDate,
            Status: true,
          },
        },
      }
    );
    await Car.updateOne(
      { userId: driver },
      {
        $set: { RideStatus: "booked" },
      }
    );

    return res.status(200).json(findBooking);
  } catch (error) {
    console.log(error.message, "message");
    res.status(500);
  }
};
const carFind = async (req, res) => {
  try {
    const { id } = req.query;
    const findcar = await Car.findOne({ userId: id });
    res.status(200).json(findcar);
  } catch (error) {
    console.log(error.message);
  }
};
const editProfile = async (req, res) => {
  try {
    const { name, email, userid } = req.body;
    const updateProfile = await user.findOneAndUpdate(
      { _id: userid },
      {
        $set: {
          name: name,
          email: email,
        },
      },
      { new: true }
    );
    res.status(200).json(updateProfile);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
const getUser = async (req, res) => {
  try {
    const { id } = req.query;
    const findUser = await user.findById({ _id: id });
    res.status(200).json(findUser);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
const findHistory = async (req, res) => {
  try {
    const { userid } = req.query;
    const history = await booking
      .find({ passenger: userid })
      .populate("driver")
      .sort({ _id: -1 });
    console.log(history, "this is history");
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const cancelTrip = async (req, res) => {
  try {
    const { tripid } = req.body;
    const cancelUpdate = await booking.findOneAndUpdate(
      { _id: tripid },
      { $set: { bookingStatus: "Cancelled" } },
      { new: true }
    );
    const cancelled = await Car.findOneAndUpdate(
      { userId: cancelUpdate.driver },
      { $set: { RideStatus: "not booked" } },
      { new: true }
    );
    res.status(200).json({ message: "canceled", cancelUpdate });
  } catch (error) {
    console.log(error.message, "thiss is message");
  }
};
const findTrip = async (req, res) => {
  try {
    const { tripid } = req.query;
    const trip = await booking.findOne({ _id: tripid });
    console.log(trip, "this is tripid");
    res.status(200).json(trip);
  } catch (error) {}
};
const payment = async (req, res) => {
  try {
    const { tripid, pay } = req.body;
    const currentDate = new Date().toJSON().slice(0, 10);
    const paymentUpdate = await booking.findOneAndUpdate(
      { _id: tripid },
      {
        $set: { "payment.status": true },
      }
    );
    const UpdateDriverWallet = await wallet.findOneAndUpdate(
      { ownerId: paymentUpdate.driver },
      {
        $inc: { currentBalance: pay },
        $push: {
          transactions: {
            payee: paymentUpdate.passenger,
            amount: pay,
            recever: paymentUpdate.driver,
            Date: currentDate,
            Status: true,
          },
        },
      }
    );
    const UpdateUserWallet = await wallet.findOneAndUpdate(
      { ownerId: paymentUpdate.passenger },
      {
        $push: {
          transactions: {
            payee: paymentUpdate.passenger,
            amount: pay,
            recever: paymentUpdate.driver,
            Date: currentDate,
            Status: true,
          },
        },
      }
    );
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: "somthing went wrong" });
  }
};

const filtterTable = async (req, res) => {
  try {
    const { status } = req.query;
    if (status === "Cancelled") {
      const cancelled = await booking.find({ bookingStatus: "Cancelled" }).populate("driver");;
      return res.status(200).json(cancelled);
    }
    if (status === "Pending") {
      const Pending = await booking.find({ bookingStatus: "Pending" }).populate("driver");;
      return res.status(200).json(Pending);
    }
    if (status === "Rejected") {
      const Rejected = await booking.find({ bookingStatus: "rejected" }).populate("driver");;
      return res.status(200).json(Rejected);
    }
    if (status === "confirmed") {
      const confirmed = await booking.find({ bookingStatus: "confirmed" }).populate("driver");;
      return res.status(200).json(confirmed);
    }
    if (status === "All") {
      const ALL = await booking.find().sort({ _id: -1 });
      return res.status(200).json(ALL);
    }
   
    const drivers = await booking.find().populate("driver");
    const searchwise = drivers.filter((item)=>
      item.driver.name.toLowerCase().indexOf(status.toLowerCase()) !== -1
    )
    res.status(200).json(searchwise)
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  signup,
  login,
  verifyLink,
  carList,
  bookCar,
  carFind,
  editProfile,
  getUser,
  findHistory,
  cancelTrip,
  findTrip,
  payment,
  filtterTable,
};
