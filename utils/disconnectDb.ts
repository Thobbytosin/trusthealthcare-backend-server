import mongoose from "mongoose";

const disconnectDB = async () => {
  try {
    console.log("Attempting to disconnect...");
    await mongoose.connection.close();
    console.log("DATABASE DIS-CONNECTED");
  } catch (error) {
    console.log("DATABASE DISCONNECTION ERROR", error);
  }
};

export default disconnectDB;
