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
      enum: ['ongoing', 'completed'],
      default: 'ongoing'
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },

    textstructure: {
      type: [String],
      enum: ['title', 'subtitle', 'headline', 'subheadline', 'copytext']
    },
    originalText: {
      type: mongoose.Types.ObjectId,
      ref: 'textSubmission'
    },
    translations: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'textSubmissionSchema'
      }
    ]
  },
  {
    timestamps: {
      createdAt: 'creationDate',
      updatedAt: 'updateDate'
    }
  }
);

module.exports = mongoose.model('Project', projectSchema);
