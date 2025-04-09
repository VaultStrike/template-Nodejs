const mongoose = require('mongoose');
const chalk = require('chalk');

// Database name
const DB_NAME = 'nikita-shaik-mongo-poc';

// MongoDB connection function
const connectToMongoDB = async () => {
    try {
      // Connect to MongoDB
      await mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`);
      console.log(chalk.green('Connected to MongoDB successfully'));
      return true;
    } catch (error) {
      console.error(chalk.red('Error connecting to MongoDB:'), error.message);
      return false;
    }
  };

module.exports = { connectToMongoDB };