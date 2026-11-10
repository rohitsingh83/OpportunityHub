const mongoose = require('mongoose');
const { MemoryOpportunity } = require('../config/memoryStore');

/**
 * A job / internship opportunity posted on the portal.
 * Fields required by the brief:
 * title, company, domain, location, experience, description, applicationLink
 * (+ type to distinguish Internship vs Job)
 */
const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job/Internship title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      maxlength: [60, 'Domain cannot exceed 60 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    experience: {
      type: String,
      required: [true, 'Experience requirement is required'],
      trim: true,
      maxlength: [80, 'Experience cannot exceed 80 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    applicationLink: {
      type: String,
      required: [true, 'Application link is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Internship', 'Job'],
      default: 'Internship',
    },
    salary: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Salary cannot exceed 80 characters'],
    },
  },
  { timestamps: true }
);

// Index to make search queries fast
opportunitySchema.index({ title: 1, company: 1, domain: 1, location: 1 });

const NativeOpportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', opportunitySchema);

// Transparent proxy: if connected to real MongoDB, executes on MongoDB.
// Otherwise, uses the embedded memory store without needing external binaries.
const OpportunityProxy = new Proxy(NativeOpportunity, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MemoryOpportunity) {
      return MemoryOpportunity[prop];
    }
    return target[prop];
  },
});

module.exports = OpportunityProxy;
