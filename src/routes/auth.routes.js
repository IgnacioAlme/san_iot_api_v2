const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('staff_id').notEmpty(),
  body('roles').isArray()
], authController.signup);

router.post('/signin', [
  body('email').isEmail(),
  body('password').notEmpty()
], authController.signin);

router.post('/refresh-token', authController.refreshToken);

module.exports = router;