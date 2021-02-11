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
      type: String,
      default:
        'https://res.cloudinary.com/drqqpp/image/upload/c_scale,w_300/v1613041505/pexels-anni-roenkae-3109821_gtgdys.jpg'
    },
    status: {
      type: String,
      enum: ['in progress', 'completed'],
      default: 'in progress'
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: mongoose.Types.ObjectId,
      ref: 'Textblock'
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
