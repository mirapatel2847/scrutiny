'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const scoreSchema = new Schema(
  {
    severity:      { type: Number, min: 1, max: 5, required: true },
    likelihood:    { type: Number, min: 1, max: 5, required: true },
    blastRadius:   { type: Number, min: 1, max: 5, required: true },
    lateDetection: { type: Number, min: 1, max: 5, required: true },
    confidence:    { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const evidenceSchema = new Schema(
  {
    claimId:  { type: Schema.Types.ObjectId, ref: 'Claim' },
    quote:    { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const findingSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['gap', 'contradiction', 'workflow', 'data'],
      required: true,
    },
    title:          { type: String, required: true },
    question:       { type: String, required: true },
    whyItMatters:   { type: String, required: true },
    recommendation: { type: String, required: true },
    scores:         { type: scoreSchema, required: true },
    priority:       { type: Number },
    tier:           { type: String },
    isHypothesis:   { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['open', 'accepted', 'rejected'],
      default: 'open',
      index: true,
    },
    evidence: [evidenceSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Finding', findingSchema);
