const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

/**
 * POST /api/applications
 * Body: { opportunityId, name, email, phone?, resumeLink?, coverLetter? }
 */
async function createApplication(req, res, next) {
  try {
    const { opportunityId, name, email, phone, resumeLink, coverLetter } = req.body;

    if (!opportunityId || !name || !email) {
      return res
        .status(400)
        .json({ message: 'opportunityId, name and email are required' });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const application = await Application.create({
      opportunity: opportunityId,
      name,
      email,
      phone,
      resumeLink,
      coverLetter,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications   (admin) — optional ?opportunityId=, ?status=, ?search=
async function getApplications(req, res, next) {
  try {
    const filter = {};
    if (req.query.opportunityId) filter.opportunity = req.query.opportunityId;
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
    if (req.query.search && req.query.search.trim()) {
      const regex = { $regex: req.query.search.trim(), $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const applications = await Application.find(filter)
      .populate('opportunity', 'title company domain location type')
      .sort({ createdAt: -1 });

    res.json({ count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id  (used by the confirmation page)
async function getApplication(req, res, next) {
  try {
    const application = await Application.findById(req.params.id).populate(
      'opportunity',
      'title company domain location type applicationLink'
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    next(err);
  }
}

// PATCH /api/applications/:id/status or PUT /api/applications/:id   (admin)
async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['Submitted', 'Under Review', 'Shortlisted', 'Rejected'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('opportunity', 'title company domain location type');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application status updated', data: application });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    next(err);
  }
}

// DELETE /api/applications/:id   (admin)
async function deleteApplication(req, res, next) {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Application not found' });
    next(err);
  }
}

module.exports = {
  createApplication,
  getApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
};

