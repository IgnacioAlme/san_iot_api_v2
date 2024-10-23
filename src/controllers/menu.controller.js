const db = require('../config/database');

exports.createMenu = async (req, res) => {
  try {
    const { descripcion_corta_menu, descripcion_larga_menu, habilitado_menu } = req.body;

    const [result] = await db.execute(
      'INSERT INTO menus (descripcion_corta_menu, descripcion_larga_menu, habilitado_menu) VALUES (?, ?, ?)',
      [descripcion_corta_menu, descripcion_larga_menu, habilitado_menu]
    );

    res.status(201).json({
      message: 'Menú creado',
      menuId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creando menú', error: err.message });
  }
};

exports.assignMenuToUser = async (req, res) => {
  try {
    const { id_menu_mxuser, id_user_mxuser } = req.body;

    await db.execute(
      'INSERT INTO mxusers (id_menu_mxuser, id_user_mxuser) VALUES (?, ?)',
      [id_menu_mxuser, id_user_mxuser]
    );

    res.status(201).json({ message: 'Menú asignado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error asignando menú', error: err.message });
  }
};