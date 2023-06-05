require("dotenv").config();
const bcrypt = require("bcrypt");
const user = require("../../models/user");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    

    const findAdmin = await user.findOne({ email: email });
    if(findAdmin.isAdmin===true&&findAdmin){
        const isPasswordCorrect = await bcrypt.compare(
            password,
            findAdmin.password
          );
          console.log(isPasswordCorrect, "password");
          if (!isPasswordCorrect) {
            return res.json({ status: "incorrect password" });
          }
          console.log(findAdmin, "find admin ");
          if (findAdmin.status === true && isPasswordCorrect) {
            const toke = jwt.sign(
              { id: findAdmin._id, role: "admin" },
              "ClientTokenSecret",
              { expiresIn: "5h" }
            );
            
            res.status(200).json({ token: toke, admin: findAdmin, status: "Login success" });
            
          }
    }else{
        
        res.json({ status: "User doesn't exist" });
    }
   
  } catch (error) {
    console.log(error.message);
    res.json({ status: "something wrong" });
  }
};

module.exports = {
    login
};
