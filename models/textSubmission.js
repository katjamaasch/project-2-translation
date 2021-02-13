'use strict';

const mongoose = require('mongoose');

const textSubmissionSchema = new mongoose.Schema({
  language: {
    type: String,
    default: 'german'
  },
  textareas: [String],
  author: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('textSubmission', textSubmissionSchema);
