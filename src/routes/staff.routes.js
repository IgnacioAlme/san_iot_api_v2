const express = require('express');
const { body } = require('express-validator');
const staffController = require('../controllers/staff.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  verifyToken,
  hasRole(['admin']),
  body('dni_staff').isLength({ min: 7, max: 8 }),
  body('nombre_staff').notEmpty(),
  body('apellido_staff').notEmpty(),
  body('cuil_staff').isLength({ min: 11, max: 11 })
], staffController.createStaff);

module.exports = router;