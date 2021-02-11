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
  image: {
    type: String,
    default:
      'https://res.cloudinary.com/drqqpp/image/upload/c_scale,w_300/v1613058483/pexels-ilargian-faus-1629781_o8hohs.jpg'
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
  department: {
    type: String,
    default: 'Editorial Department'
  }
});

module.exports = mongoose.model('User', schema);
