import sequelize from "../config/pg-database";

// Function to sync models with the database
export const syncDatabase = async () => {
  try {
    await sequelize.authenticate(); // Test connection
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true });

    // await sequelize.sync({ alter: true }); // Sync models (creates tables)
    // console.log("✅ Tables created/updated successfully");
  } catch (error) {
    console.error("❌ Database sync error:", error);
  }
};
