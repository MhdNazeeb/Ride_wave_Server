const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Car = require("../../models/car");
const nodemailer = require("nodemailer");
const { token } = require("morgan");
const jwt_decode = require("jwt-decode");
const booking = require("../../models/Booking");
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
        await user
          .findOneAndUpdate(
            { email: email },
            {
              name: fname,
              isUser: true,
              password: hashedpassword,
              confirm_password: hashedconfirmpassword,
            }
          )
          .then(() => {
            return res
              .status(200)
              .json({ message: "new account created sucessfully" });
          });
      }
      await user
        .create({
          name: fname,
          email: email,
          isUser: true,
          EmailToken: crypto.randomBytes(64).toString("hex"),
          password: hashedpassword,
          confirm_password: hashedconfirmpassword,
        })
        .then(() => {
          return res
            .status(200)
            .json({ message: "new account created sucessfully" });
        })
        .catch((e) => {
          return res.status(500);
        });
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
    console.log(findUser, "find user ");
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
  //   const {  pickup,drop } = req.query;
  //   console.log(req.query)
  //  console.log(  pickup,drop )
  //   let carid = [];
  //   const FindCar = await booking.find({
  //     "location.pickup": pickup,
  //     "location.dropoff": drop,
  //   });
  //   FindCar.map((val)=>{
  //     carid.push(val.driver.toString())
  //   })
  //   console.log(carid,"llladasa")
      const findCar = await Car.find({LocationStatus:'on'}).populate("userId");
      console.log(
        findCar,"llllllllllllllll");
      res.status(200).json(findCar);
   
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};
const bookCar = async (req, res) => {
  try {
    const { pickup, dropOff, driver, distance, date, userid, Rate, time } =
      req.body;
    const otp = Math.floor(500000 + Math.random() * 5000000);
    const findCheckout = await booking.findOne({
      driver: driver._id,
      bookingStatus: "Pending",
    });
    const perSeat = Rate / 4;
    if (!findCheckout) {
      const findChekout = await booking.create({
        driver: driver._id,
        date: date,
        time: time,
        location: {
          pickup: pickup,
          dropoff: dropOff,
          distance: distance,
        },
        verficationCode: otp,
        bookingStatus: "Pending",
        passengers: [
          {
            user: userid,
            advancePayment: {
              status: true,
              amount: perSeat,
            },
            totalPayment: {
              amount: Rate,
            },
          },
        ],
      });
      const updateCar = await Car.findOneAndUpdate(
        { userId: driver._id },
        { $set: { RideStatus: "booked" } }
      );
      res.status(200).json(findChekout);
    } else {
      const updatedBooking = await booking.findOneAndUpdate(
        { driver: driver._id },
        {
          $push: {
            passengers: {
              user: userid,
              advancePayment: {
                status: true,
                amount: perSeat,
              },
              totalPayment: {
                amount: Rate,
              },
            },
          },
        },
        { new: true }
      );
      const updateCar = await Car.findOneAndUpdate(
        { userId: driver._id },
        { $set: { RideStatus: "booked" } }
      );
      console.log(updatedBooking, "thisssss updated booking");
      res.status(200).json(updatedBooking);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500);
  }
};
module.exports = {
  signup,
  login,
  verifyLink,
  carList,
  bookCar,
};
