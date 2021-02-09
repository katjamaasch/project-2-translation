'use strict';

const mongoose = require('mongoose');

// Shall we add required for name, password ?
// Do we want to have a profile picture? Or only in the wish list and not the MVP?
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHashAndSalt: {
    type: String
  },
  role: {
    type: String,
    enum: ['publisher', 'viewer'],
    required: true
  },
  /*we have to figure out, how to deal best with the languages*/
<<<<<<< HEAD

  language: {
    type: [String]
=======
  department: {
    type: String
>>>>>>> 46e02b8e724883087e568ca3026594b9ec499eca
  }
});

module.exports = mongoose.model('User', schema);
