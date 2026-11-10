const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

/**
 * GET /api/opportunities
 * Query params (all optional):
 *   search   - case-insensitive match on title, company, location, domain, description
 *   domain   - exact domain filter (use "All" or omit to skip)
 *   type     - "Internship" | "Job" (use "All" or omit to skip)
 *   location - case-insensitive match on location
 */
async function getOpportunities(req, res, next) {
  try {
    const { search, domain, type, location } = req.query;
    const filter = {};

    if (domain && domain !== 'All') filter.domain = domain;
    if (type && type !== 'All') filter.type = type;
    if (location) filter.location = { $regex: location.trim(), $options: 'i' };
    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { title: regex },
        { company: regex },
        { location: regex },
        { domain: regex },
        { description: regex },
      ];
    }

    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json({ count: opportunities.length, data: opportunities });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/domains  -> distinct list of domains used for the filter dropdown
async function getDomains(req, res, next) {
  try {
    const domains = await Opportunity.distinct('domain');
    res.json({ count: domains.length, data: domains.sort() });
  } catch (err) {
    next(err);
  }
}

// GET /api/opportunities/:id
async function getOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(opportunity);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Opportunity not found' });
    next(err);
  }
}

// POST /api/opportunities   (admin)
async function createOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.create(req.body);
    res.status(201).json({ message: 'Opportunity created', data: opportunity });
  } catch (err) {
    next(err);
  }
}

// PUT /api/opportunities/:id   (admin)
async function updateOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ message: 'Opportunity updated', data: opportunity });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Opportunity not found' });
    next(err);
  }
}

// DELETE /api/opportunities/:id   (admin) — also removes its applications
async function deleteOpportunity(req, res, next) {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    await Application.deleteMany({ opportunity: opportunity._id });
    res.json({ message: 'Opportunity deleted', data: opportunity });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Opportunity not found' });
    next(err);
  }
}

// GET /api/opportunities/stats
async function getStats(req, res, next) {
  try {
    const [totalOpportunities, internships, jobs, domains, applications] = await Promise.all([
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ type: 'Internship' }),
      Opportunity.countDocuments({ type: 'Job' }),
      Opportunity.distinct('domain'),
      Application.countDocuments(),
    ]);
    res.json({
      opportunities: totalOpportunities,
      internships,
      jobs,
      domains: domains.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOpportunities,
  getDomains,
  getStats,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};

