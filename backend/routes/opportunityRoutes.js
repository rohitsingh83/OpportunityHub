const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/opportunityController');
const adminOnly = require('../middleware/admin');

// Public
router.get('/', ctrl.getOpportunities);          // list + search + filter
router.get('/domains', ctrl.getDomains);          // distinct domains (filter dropdown)
router.get('/stats', ctrl.getStats);              // platform statistics
router.get('/:id', ctrl.getOpportunity);          // details


// Admin (protected by ADMIN_KEY when configured, see middleware/admin.js)
router.post('/', adminOnly, ctrl.createOpportunity);
router.put('/:id', adminOnly, ctrl.updateOpportunity);
router.delete('/:id', adminOnly, ctrl.deleteOpportunity);

module.exports = router;
