import { beforeAll, afterAll } from 'vitest';
import { sequelize } from '../lib/db/sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  try {
    // Authenticate the database before running tests
    await sequelize.authenticate();
    
    // NOTE: We are using the development database for testing.
    // DO NOT USE sequelize.sync({ force: true }) or truncate tables here.
    
    console.log('Database connected for testing (using development database).');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Close the database connection after all tests
  await sequelize.close();
});
