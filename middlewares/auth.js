const jwt = require("jsonwebtoken");

const verifyTokenAdmin = async (req, res, next) => {
  try {
    
    let token = req.headers["authorization"];
    console.log('admin token = ', token)
    console.log(token,'admin')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, "admin_secret");
    req.user = verified;

    if (verified.role == "admin") {
      console.log("admin with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error in auth middleware')
    res.status(500).json({ message: err.message });
  }
};

const verifyTokenClient = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    console.log(token,'client token')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token, "ClientTokenSecret");
    console.log(verified,'this verifird');
    req.user = verified;
    if (verified.role == "user") {
      console.log("client with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error in client auth middleware...')
    res.status(500).json({ message: err.message });
  }
};

const verifyTokenDriver = async (req, res, next) => {
  try {
     
    let token = req.headers["authorization"];
    console.log(token,'driver token')
    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      console.log('start with');
      token = token.slice(7, token.length).trimLeft();
    }
    const verified = jwt.verify(token,"DriverTokenSecret");
    req.user = verified;
    
    if (verified.role == "driver") {
      console.log("DRIVER with token");
      next();
    } else {
      return res.status(403).send("Access Denied");
    }
  } catch (err) {
    console.log(err.message,'error message in driver auth middleware')
    res.status(500).json({ message: err.message });
  }
};

module.exports = { verifyTokenAdmin, verifyTokenClient, verifyTokenDriver };
