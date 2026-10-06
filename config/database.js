const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/PennywiseDB";

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
