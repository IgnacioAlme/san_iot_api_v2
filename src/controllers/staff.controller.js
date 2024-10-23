const db = require('../config/database');

exports.createStaff = async (req, res) => {
  try {
    const {
      tipo_dni_staff,
      dni_staff,
      nombre_staff,
      apellido_staff,
      cuil_staff,
      provincia_staff,
      localidad_stff,
      cp_staff,
      domicilio_staff,
      fecha_nacimiento_staff,
      estado_civil_staff,
      celular_staff,
      telefono_fijo_staff,
      telefono_contacto_staff
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO staffs (
        tipo_dni_staff, dni_staff, nombre_staff, apellido_staff, cuil_staff,
        provincia_staff, localidad_stff, cp_staff, domicilio_staff,
        fecha_nacimiento_staff, estado_civil_staff, celular_staff,
        telefono_fijo_staff, telefono_contacto_staff
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_dni_staff, dni_staff, nombre_staff, apellido_staff, cuil_staff,
        provincia_staff, localidad_stff, cp_staff, domicilio_staff,
        fecha_nacimiento_staff, estado_civil_staff, celular_staff,
        telefono_fijo_staff, telefono_contacto_staff
      ]
    );

    res.status(201).json({
      message: 'Staff creado exitosamente',
      staffId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creando staff', error: err.message });
  }
};