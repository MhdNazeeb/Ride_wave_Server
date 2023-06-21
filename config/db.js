const mongoose = require('mongoose') ;
require('dotenv').config()

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATA_BASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`db connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;