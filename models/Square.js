const mongoose = require('mongoose');

// Define Square schema
const squareSchema = new mongoose.Schema({
  length: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  isFilled: {
    type: Boolean,
    required: true,
    default: false
  },
  text: {
    type: String,
    required: true,
    default: ''
  },
  textColor: {
    type: String,
    required: true,
    default: 'black'
  }
});

// Create and export the model
const Square = mongoose.model('Square', squareSchema);

module.exports = Square;