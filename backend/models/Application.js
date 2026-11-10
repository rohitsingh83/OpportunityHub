const mongoose = require('mongoose');
const { MemoryApplication } = require('../config/memoryStore');

/**
 * An application submitted by a user for one opportunity.
 * resumeLink = bonus "resume upload" (stored as a link to the uploaded file).
 */
const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity is required'],
    },
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    resumeLink: {
      type: String,
      trim: true,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted', 'Rejected'],
      default: 'Submitted',
    },
  },
  { timestamps: true }
);

const NativeApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);

// Transparent proxy: if connected to real MongoDB, executes on MongoDB.
// Otherwise, uses the embedded memory store without needing external binaries.
const ApplicationProxy = new Proxy(NativeApplication, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MemoryApplication) {
      return MemoryApplication[prop];
    }
    return target[prop];
  },
});

module.exports = ApplicationProxy;
