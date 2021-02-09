// Properties: Client name, project name, status, creator, date

'use strict';

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: true
    },
    projectname: {
      type: String,
      required: true
    },
    projectimage: {
      type: String
    },
    status: {
      type: String,
      enum: ['in progress', 'completed'],
      default: 'in progress'
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
