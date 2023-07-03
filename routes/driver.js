const express = require("express");
const router = express.Router();
const {
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
  findTrip
} = require("../controller/driver/driver");
const { verifyTokenDriver } = require("../middlewares/auth");
/* GET driver listing. */

router.post("/signup", signup);
router.post("/login", login);
router.post("/car", verifyTokenDriver, carRegister);
router.patch("/profile", verifyTokenDriver, profile);
router.get("/profile", verifyTokenDriver, getProfile);
router.get("/car", verifyTokenDriver, getCar);
router.patch("/car", verifyTokenDriver, editCar);
router.get("/Carfound", car);
router.post("/location", verifyTokenDriver, driverLocation);
router.get("/ride", verifyTokenDriver, availableRide);
router.post("/ride", verifyTokenDriver, rjectRide);
router.get("/trip", verifyTokenDriver, getTrip);
router.get("/trip_status", findTrip);

module.exports = router;
