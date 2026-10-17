'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    findingId: {
      type: Schema.Types.ObjectId,
      ref: 'Finding',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    editedText: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
