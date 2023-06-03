const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { token } = require("morgan");
const signup = async (req, res) => {
  try {
    const { fname, password, cpassword, email } = req.body;

    if (password && cpassword) {
      const hashedpassword = await bcrypt.hash(password, 10);
      const hashedconfirmpassword = await bcrypt.hash(cpassword, 10);
      await user
        .create({
          name: fname,
          email: email,
          EmailToken: crypto.randomBytes(64).toString("hex"),
          password: hashedpassword,
          confirm_password: hashedconfirmpassword,
        })
        .then(() => {
          res.status(200).json({ message: "new account created sucessfully" });
        })
        .catch(() => {
          res.status(500);
        });
    }
  } catch (error) {
    res.status(500);
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await user.findOne({ email: email });
    if (!findUser) return res.json({ status: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, findUser.password);
    console.log(isPasswordCorrect, "password");
    if (!isPasswordCorrect) {
      res.json({ status: "password not Found" });
    }
    console.log(findUser, "find user ");
    if (findUser.status === true && isPasswordCorrect) {
      const toke = jwt.sign(
        { id: findUser._id, role: "user" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );
      if (!findUser.isverify) {
        console.log('kkkkkkkkkkk');
         sendEmail(findUser,res);
        
      }
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
      console.log("errrrrrrr");
      res.status(404).json({status:error.message})
    } else {
      console.log("sssssssss");
      res.status(200).json({status:`verification link has been send to ${info.accepted[0]}`})
     
    }
  });
};

const verifyLink = async (req, res) => {
  try {
    const { userid } = req.query;
    console.log(userid)
    const isverifyuser = await user.findByIdAndUpdate(
      { _id: userid },
      { $set: { isverify: true } },
      { new: true }
    );
    const toke = jwt.sign(
      { id: isverifyuser._id, role: "user" },
      "ClientTokenSecret",
      { expiresIn: "5h" }
    );
    res.status(200).json({token:toke})
    
  } catch (error) {
console.log(error.message);
  }
};

module.exports = {
  signup,
  login,
  verifyLink,
};
