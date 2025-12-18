import { sequelize } from "./lib/db/sequelize";
import "./models"; 

async function sync() {
  try {
    console.log("Syncing database...");
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Error syncing database:", error);
  } finally {
    await sequelize.close();
  }
}

sync();
