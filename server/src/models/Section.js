'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'SourceFile',
      required: true,
      index: true,
    },
    heading: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: true,
    },
    startLine: { type: Number, required: true },
    endLine:   { type: Number, required: true },
    startChar: { type: Number, required: true },
    endChar:   { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Section', sectionSchema);
