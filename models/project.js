// Properties: Client name, project name, status, creator, date

'use strict';

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: true
    },
    project: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed'],
      required: true
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: {
      createdAt: 'creationDate',
      updatedAt: 'updateDate'
    }
  }
);

module.exports = mongoose.model('Project', projectSchema);
