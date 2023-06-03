const mongoose = require('mongoose') ;

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://naseebn819:naseebn819@cluster0.uy9qt6g.mongodb.net/ridewave', {
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