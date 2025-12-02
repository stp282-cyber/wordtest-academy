const express = require('express');
const router = express.Router();
const academyController = require('../controllers/academyController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { ROLES } = require('../config/constants');

// Only Super Admin can manage academies
router.post('/', auth, requireRole([ROLES.SUPER_ADMIN]), academyController.createAcademy);
router.get('/', auth, requireRole([ROLES.SUPER_ADMIN]), academyController.getAllAcademies);
router.get('/:id', auth, requireRole([ROLES.SUPER_ADMIN]), academyController.getAcademyById);
router.put('/:id', auth, requireRole([ROLES.SUPER_ADMIN]), academyController.updateAcademy);

module.exports = router;
