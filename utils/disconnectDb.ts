import mongoose from "mongoose";

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("DATABASE DISCONNECTED SUCCESSFULLY");
  } catch (error) {
    console.log("DATABASE DISCONNECTION ERROR", error);
  }
};

export default disconnectDB;
