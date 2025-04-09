const readline = require('node:readline');
const { connectToMongoDB } = require('../models/db');
const Square = require('../models/Square');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Initialize database with 3 squares if empty
const initializeDb = async () => {
  // Check if there are any squares
  const count = await Square.countDocuments();
  
  if (count === 0) {
    console.log('Initializing database with sample squares...');
    
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
    console.log('Sample squares added successfully!');
  }
};

// List all squares
const listSquares = async () => {
  const squares = await Square.find();
  console.log('\n===== ALL SQUARES =====');
  
  if (squares.length === 0) {
    console.log('No squares found in the database.');
  } else {
    squares.forEach((square, index) => {
      console.log(`[${index + 1}] Length: ${square.length}, Color: ${square.color}, Filled: ${square.isFilled ? 'Yes' : 'No'}, Text: "${square.text}", Text Color: ${square.textColor}, ID: ${square._id}`);
    });
  }
  
  return squares;
};

// Add a new square
const addSquare = async () => {
  console.log('\n===== ADD NEW SQUARE =====');
  
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
  console.log('Square added successfully!');
};

// Update a square
const updateSquare = async (squares) => {
  console.log('\n===== UPDATE SQUARE =====');
  
  const index = parseInt(await askQuestion('Enter the number of the square to update: ')) - 1;
  
  if (index < 0 || index >= squares.length) {
    console.log('Invalid square number.');
    return;
  }
  
  const square = squares[index];
  
  console.log(`Updating Square: Length: ${square.length}, Color: ${square.color}, Filled: ${square.isFilled ? 'Yes' : 'No'}, Text: "${square.text}", Text Color: ${square.textColor}`);
  
  const length = parseInt(await askQuestion(`Enter new length (${square.length}): `) || square.length);
  const color = await askQuestion(`Enter new color (${square.color}): `) || square.color;
  const filledResponse = await askQuestion(`Is filled? (yes/no) (${square.isFilled ? 'yes' : 'no'}): `);
  const isFilled = filledResponse ? filledResponse.toLowerCase() === 'yes' : square.isFilled;
  const text = await askQuestion(`Enter new text (${square.text}): `) || square.text;
  const textColor = await askQuestion(`Enter new text color (${square.textColor}): `) || square.textColor;
  
  await Square.findByIdAndUpdate(square._id, {
    length,
    color,
    isFilled,
    text,
    textColor
  });
  
  console.log('Square updated successfully!');
};

// Delete a square
const deleteSquare = async (squares) => {
  console.log('\n===== DELETE SQUARE =====');
  
  const index = parseInt(await askQuestion('Enter the number of the square to delete: ')) - 1;
  
  if (index < 0 || index >= squares.length) {
    console.log('Invalid square number.');
    return;
  }
  
  const square = squares[index];
  
  const confirm = await askQuestion(`Are you sure you want to delete this square? (yes/no): 
  Length: ${square.length}, Color: ${square.color}, Filled: ${square.isFilled ? 'Yes' : 'No'}, Text: "${square.text}", Text Color: ${square.textColor}
  `);
  
  if (confirm.toLowerCase() === 'yes') {
    await Square.findByIdAndDelete(square._id);
    console.log('Square deleted successfully!');
  } else {
    console.log('Deletion cancelled.');
  }
};

// Display menu and handle user input
const showMenu = async () => {
  while (true) {
    console.log('\n===== SQUARE MANAGEMENT MENU =====');
    console.log('1. List all squares');
    console.log('2. Add a new square');
    console.log('3. Update a square');
    console.log('4. Delete a square');
    console.log('5. Exit');
    
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
        console.log('Exiting application. Goodbye!');
        rl.close();
        return;
      
      default:
        console.log('Invalid choice. Please enter a number between 1 and 5.');
    }
  }
};

// Main function to run the application
const runApp = async () => {
  console.log('Starting Square Management Application...');
  
  // Connect to MongoDB
  const connected = await connectToMongoDB();
  
  if (connected) {
    // Initialize DB with sample data if needed
    await initializeDb();
    
    // Show the main menu
    await showMenu();
  } else {
    console.log('Failed to connect to MongoDB. Make sure MongoDB is running.');
    rl.close();
  }
};

module.exports = { runApp };