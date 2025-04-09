const readline = require('node:readline');
const { connectToMongoDB } = require('../models/db');
const Square = require('../models/Square');
const chalk = require('chalk');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(chalk.cyan(question), (answer) => {
      resolve(answer);
    });
  });
};

// Initialize database with 3 squares if empty
const initializeDb = async () => {
  // Check if there are any squares
  const count = await Square.countDocuments();
  
  if (count === 0) {
    console.log(chalk.yellow('Initializing database with sample squares...'));
    
    // Create 3 initial squares
    const initialSquares = [
      {
        length: 5,
        color: 'red',
        isFilled: true,
        text: 'Square 1',
        textColor: 'white'
      },
      {
        length: 10,
        color: 'blue',
        isFilled: false,
        text: 'Square 2',
        textColor: 'black'
      },
      {
        length: 7,
        color: 'green',
        isFilled: true,
        text: 'Square 3',
        textColor: 'yellow'
      }
    ];
    
    // Save the squares to the database
    await Square.insertMany(initialSquares);
    console.log(chalk.green('Sample squares added successfully!'));
  }
};

// List all squares
const listSquares = async () => {
  const squares = await Square.find();
  console.log(chalk.bold.magenta('\n===== ALL SQUARES ====='));
  
  if (squares.length === 0) {
    console.log(chalk.yellow('No squares found in the database.'));
  } else {
    squares.forEach((square, index) => {
      console.log(
        chalk.white(`[${chalk.bold.green(index + 1)}] `) +
        chalk.yellow(`Length: ${chalk.white(square.length)}, `) +
        chalk.yellow(`Color: ${chalk.white(square.color)}, `) +
        chalk.yellow(`Filled: ${square.isFilled ? chalk.green('Yes') : chalk.red('No')}, `) +
        chalk.yellow(`Text: "${chalk.white(square.text)}", `) +
        chalk.yellow(`Text Color: ${chalk.white(square.textColor)}`) +
        chalk.gray(`, ID: ${square._id}`)
      );
    });
  }
  
  return squares;
};

// Add a new square
const addSquare = async () => {
  console.log(chalk.bold.magenta('\n===== ADD NEW SQUARE ====='));
  
  const length = parseInt(await askQuestion('Enter length: '));
  const color = await askQuestion('Enter color: ');
  const isFilled = (await askQuestion('Is filled? (yes/no): ')).toLowerCase() === 'yes';
  const text = await askQuestion('Enter text: ');
  const textColor = await askQuestion('Enter text color: ');
  
  const newSquare = new Square({
    length,
    color,
    isFilled,
    text,
    textColor
  });
  
  await newSquare.save();
  console.log(chalk.green('Square added successfully!'));
};

// Update a square
const updateSquare = async (squares) => {
  console.log(chalk.bold.magenta('\n===== UPDATE SQUARE ====='));
  
  const index = parseInt(await askQuestion('Enter the number of the square to update: ')) - 1;
  
  if (index < 0 || index >= squares.length) {
    console.log(chalk.red('Invalid square number.'));
    return;
  }
  
  const square = squares[index];
  
  console.log(chalk.yellow(`Updating Square: `) + 
    chalk.white(`Length: ${square.length}, Color: ${square.color}, `) +
    chalk.white(`Filled: ${square.isFilled ? 'Yes' : 'No'}, `) +
    chalk.white(`Text: "${square.text}", Text Color: ${square.textColor}`)
  );
  
  const length = parseInt(await askQuestion(`Enter new length (${chalk.dim(square.length)}): `) || square.length);
  const color = await askQuestion(`Enter new color (${chalk.dim(square.color)}): `) || square.color;
  const filledResponse = await askQuestion(`Is filled? (yes/no) (${chalk.dim(square.isFilled ? 'yes' : 'no')}): `);
  const isFilled = filledResponse ? filledResponse.toLowerCase() === 'yes' : square.isFilled;
  const text = await askQuestion(`Enter new text (${chalk.dim(square.text)}): `) || square.text;
  const textColor = await askQuestion(`Enter new text color (${chalk.dim(square.textColor)}): `) || square.textColor;
  
  await Square.findByIdAndUpdate(square._id, {
    length,
    color,
    isFilled,
    text,
    textColor
  });
  
  console.log(chalk.green('Square updated successfully!'));
};

// Delete a square
const deleteSquare = async (squares) => {
  console.log(chalk.bold.magenta('\n===== DELETE SQUARE ====='));
  
  const index = parseInt(await askQuestion('Enter the number of the square to delete: ')) - 1;
  
  if (index < 0 || index >= squares.length) {
    console.log(chalk.red('Invalid square number.'));
    return;
  }
  
  const square = squares[index];
  
  const confirm = await askQuestion(
    `Are you sure you want to delete this square? (yes/no):\n` +
    chalk.yellow(`  Length: ${chalk.white(square.length)}, `) +
    chalk.yellow(`Color: ${chalk.white(square.color)}, `) +
    chalk.yellow(`Filled: ${square.isFilled ? chalk.green('Yes') : chalk.red('No')}, `) +
    chalk.yellow(`Text: "${chalk.white(square.text)}", `) +
    chalk.yellow(`Text Color: ${chalk.white(square.textColor)}\n`)
  );
  
  if (confirm.toLowerCase() === 'yes') {
    await Square.findByIdAndDelete(square._id);
    console.log(chalk.green('Square deleted successfully!'));
  } else {
    console.log(chalk.yellow('Deletion cancelled.'));
  }
};

// Display menu and handle user input
const showMenu = async () => {
  while (true) {
    console.log(chalk.bold.blue('\n===== SQUARE MANAGEMENT MENU ====='));
    console.log(chalk.green('1.') + chalk.white(' List all squares'));
    console.log(chalk.green('2.') + chalk.white(' Add a new square'));
    console.log(chalk.green('3.') + chalk.white(' Update a square'));
    console.log(chalk.green('4.') + chalk.white(' Delete a square'));
    console.log(chalk.green('5.') + chalk.white(' Exit'));
    
    const choice = await askQuestion('Enter your choice (1-5): ');
    
    // Variable to store all squares (needed for update and delete operations)
    let squares;
    
    switch (choice) {
      case '1':
        await listSquares();
        break;
      
      case '2':
        await addSquare();
        break;
      
      case '3':
        squares = await listSquares();
        if (squares.length > 0) {
          await updateSquare(squares);
        }
        break;
      
      case '4':
        squares = await listSquares();
        if (squares.length > 0) {
          await deleteSquare(squares);
        }
        break;
      
      case '5':
        console.log(chalk.blue('Exiting application. Goodbye!'));
        rl.close();
        return;
      
      default:
        console.log(chalk.red('Invalid choice. Please enter a number between 1 and 5.'));
    }
  }
};

// Main function to run the application
const runApp = async () => {
  console.log(chalk.bold.green('Starting Square Management Application...'));
  
  // Connect to MongoDB
  const connected = await connectToMongoDB();
  
  if (connected) {
    // Initialize DB with sample data if needed
    await initializeDb();
    
    // Show the main menu
    await showMenu();
  } else {
    console.log(chalk.red('Failed to connect to MongoDB. Make sure MongoDB is running.'));
    rl.close();
  }
};

module.exports = { runApp };