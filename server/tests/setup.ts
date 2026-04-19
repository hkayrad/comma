import { beforeAll, afterAll } from 'vitest';
import { sequelize } from '../lib/db/sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  try {
    // Authenticate and sync the database before running tests
    await sequelize.authenticate();
    // In a real MariaDB test DB, we might want to be careful with sync({ force: true })
    // but for testing purposes it ensures a clean state.
    // Uncomment the next line if you want to wipe the test DB every time tests start.
    // await sequelize.sync({ force: true });
    
    console.log('Database connected for testing.');
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Close the database connection after all tests
  await sequelize.close();
});
