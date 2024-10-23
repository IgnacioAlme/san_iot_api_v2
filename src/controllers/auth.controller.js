const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { AppError } = require('../utils/errorHandler');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id_user, 
      email: user.email_user, 
      roles: user.roles,
      staff_id: user.id_staff_user 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id_user },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

const getUserWithRoles = async (connection, userId) => {
  const [users] = await connection.execute(
    `SELECT u.*, GROUP_CONCAT(r.name) as roles 
     FROM users u 
     LEFT JOIN user_roles ur ON u.id_user = ur.user_id 
     LEFT JOIN roles r ON ur.role_id = r.id 
     WHERE u.id_user = ?
     GROUP BY u.id_user`,
    [userId]
  );
  
  if (users.length === 0) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  const user = users[0];
  user.roles = user.roles ? user.roles.split(',') : [];
  return user;
};

exports.signup = async (req, res, next) => {
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    const { id_staff_user, email_user, password, roles } = req.body;
    
    // Check if email already exists
    const [existingUser] = await conn.execute(
      'SELECT id_user FROM users WHERE email_user = ?',
      [email_user]
    );

    if (existingUser.length > 0) {
      throw new AppError('Email actualmente en uso', 400);
    }

    // Verify staff exists
    const [staff] = await conn.execute(
      'SELECT id_staff FROM staffs WHERE id_staff = ?',
      [id_staff_user]
    );

    if (staff.length === 0) {
      throw new AppError('Staff not found', 404);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insert user
    const [result] = await conn.execute(
      'INSERT INTO users (id_staff_user, email_user, password_user) VALUES (?, ?, ?)',
      [id_staff_user, email_user, hashedPassword]
    );

    // Insert user roles
    if (roles?.length > 0) {
      const values = roles.map(roleId => [result.insertId, roleId]);
      await conn.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    
    res.status(201).json({
      status: 'éxito',
      message: 'Usuario creado'
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email_user, password } = req.body;

    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles 
       FROM users u 
       LEFT JOIN user_roles ur ON u.id_user = ur.user_id 
       LEFT JOIN roles r ON ur.role_id = r.id 
       WHERE u.email_user = ?
       GROUP BY u.id_user`,
      [email_user]
    );

    if (users.length === 0) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_user);

    if (!validPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    user.roles = user.roles ? user.roles.split(',') : [];
    const { accessToken, refreshToken } = generateTokens(user);

    // Update refresh token with expiration
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);

    await db.execute(
      'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id_user = ?',
      [refreshToken, refreshExpires, user.id_user]
    );

    // Get user's menu permissions
    const [menus] = await db.execute(
      `SELECT m.* FROM menus m
       INNER JOIN mxusers mx ON m.id_menu = mx.id_menu_mxuser
       WHERE mx.id_user_mxuser = ? AND m.habilitado_menu = 1`,
      [user.id_user]
    );

    // Get staff information
    const [staffInfo] = await db.execute(
      'SELECT * FROM staffs WHERE id_staff = ?',
      [user.id_staff_user]
    );

    res.json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id_user,
          email: user.email_user,
          roles: user.roles,
          menus,
          staff: staffInfo[0]
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token requerido', 401);
    }

    const [users] = await db.execute(
      `SELECT u.*, GROUP_CONCAT(r.name) as roles 
       FROM users u 
       LEFT JOIN user_roles ur ON u.id_user = ur.user_id 
       LEFT JOIN roles r ON ur.role_id = r.id 
       WHERE u.refresh_token = ? AND u.refresh_token_expires_at > NOW()
       GROUP BY u.id_user`,
      [refreshToken]
    );

    if (users.length === 0) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }

    const user = users[0];
    user.roles = user.roles ? user.roles.split(',') : [];

    const tokens = generateTokens(user);
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);

    await db.execute(
      'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id_user = ?',
      [tokens.refreshToken, refreshExpires, user.id_user]
    );

    res.json({
      status: 'éxito',
      data: tokens
    });
  } catch (err) {
    next(err);
  }
};