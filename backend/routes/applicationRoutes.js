const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/applicationController');
const adminOnly = require('../middleware/admin');

// Public: anyone can submit an application; anyone with the id can see its confirmation
router.post('/', ctrl.createApplication);
router.get('/:id', ctrl.getApplication);

// Admin
router.get('/', adminOnly, ctrl.getApplications);
router.patch('/:id/status', adminOnly, ctrl.updateApplicationStatus);
router.patch('/:id', adminOnly, ctrl.updateApplicationStatus);
router.put('/:id', adminOnly, ctrl.updateApplicationStatus);
router.delete('/:id', adminOnly, ctrl.deleteApplication);

module.exports = router;

