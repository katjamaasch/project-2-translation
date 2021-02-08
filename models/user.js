'use strict';

const mongoose = require('mongoose');

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
    enum: ['Publisher', 'Interpreter'],
    required: true
  },
  /*we have to figure out, how to deal best with the languages*/
  language: {
    type: [String]
  }
});

module.exports = mongoose.model('User', schema);
