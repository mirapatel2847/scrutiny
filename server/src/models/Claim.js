'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const claimSchema = new Schema(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['assumption', 'constraint', 'decision', 'dependency'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    quote: {
      type: String,
      default: '',
    },
    startChar: { type: Number },
    endChar:   { type: Number },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
