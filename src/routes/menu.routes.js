const express = require('express');
const { body } = require('express-validator');
const menuController = require('../controllers/menu.controller');
const { verifyToken, hasRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  verifyToken,
  hasRole(['admin']),
  body('descripcion_corta_menu').notEmpty(),
  body('descripcion_larga_menu').notEmpty(),
  body('habilitado_menu').isBoolean()
], menuController.createMenu);

router.post('/assign', [
  verifyToken,
  hasRole(['admin']),
  body('id_menu_mxuser').isInt(),
  body('id_user_mxuser').isInt()
], menuController.assignMenuToUser);

module.exports = router;