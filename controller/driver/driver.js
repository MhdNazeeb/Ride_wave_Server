require("dotenv").config();
const bcrypt = require("bcrypt");
const cloudinary = require("../../utils/Cloudinary");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { fname, password, cpassword, email, license } = req.body;
    const findUser = await user.findOne({ email: email });

    console.log(findUser, "this find user");
    if (findUser && findUser.isDriver) {
      console.log("user allredy ");
      return res.json({ message: "email is all ready registred" });
    }

    if (password && cpassword) {
      const hashedpassword = await bcrypt.hash(password, 10);

      const hashedconfirmpassword = await bcrypt.hash(cpassword, 10);
      console.log("this password checking");
      const file = await cloudinary.uploader.upload(license, {
        folder: "DriverLicense",
      });
      console.log(file, "this cloud file");
      await user
        .create({
          name: fname,
          email: email,
          password: hashedpassword,
          confirm_password: hashedconfirmpassword,
          license: file.secure_url,
          isDriver: true,
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

    const findDriver = await user.findOne({ email: email });
    if (!findDriver) return res.json({ status: "User doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(password, findDriver.password);
    console.log(isPasswordCorrect, "password");
    if (!isPasswordCorrect) {
      return res.json({ status: "incorrect password" });
    }
    console.log(findDriver, "find driver ");
    if (findDriver.status === true && isPasswordCorrect) {
      const toke = jwt.sign(
        { id: findDriver._id, role: "driver" },
        "ClientTokenSecret",
        { expiresIn: "5h" }
      );
      res.status(200).json({ token: toke, driver: findDriver, status: "Login success" });
      }
    }catch (error){
    console.log(error.message);
    res.json({status:'something wrong'})
    }
     
    };

module.exports = {
  signup,
  login,
};
