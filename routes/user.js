const express = require("express");
const router = express.Router();
const { verifyTokenClient } = require("../middlewares/auth");
const {
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
  payment
} = require("../controller/user/user");

/* GET home page. */
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify", verifyLink);
router.get("/carlist", carList);
router.post("/book", verifyTokenClient, bookCar);
router.get("/car", verifyTokenClient, carFind);
router.patch("/user", verifyTokenClient, editProfile);
router.get("/user", verifyTokenClient, getUser);
router.get("/history", findHistory);
router.post("/cancel_ride", cancelTrip);
router.get("/trip", findTrip);
router.post("/payment", verifyTokenClient,payment);

module.exports = router;
