-- Drop existing tables if they exist
DROP TABLE IF EXISTS mxusers;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS staffs;

-- Create staffs table
CREATE TABLE staffs (
  id_staff INT PRIMARY KEY AUTO_INCREMENT,
  tipo_dni_staff VARCHAR(4),
  dni_staff VARCHAR(8),
  nombre_staff VARCHAR(100),
  apellido_staff VARCHAR(100),
  cuil_staff VARCHAR(11),
  provincia_staff VARCHAR(50),
  localidad_stff VARCHAR(50),
  cp_staff VARCHAR(5),
  domicilio_staff VARCHAR(100),
  fecha_nacimiento_staff DATE,
  estado_civil_staff VARCHAR(20),
  celular_staff VARCHAR(30),
  telefono_fijo_staff VARCHAR(30),
  telefono_contacto_staff VARCHAR(30),
  date_created_staff DATE DEFAULT (CURRENT_DATE),
  date_updated_staff TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  id_staff_user INT NOT NULL,
  email_user VARCHAR(250) UNIQUE NOT NULL,
  password_user TEXT NOT NULL,
  refresh_token VARCHAR(255),
  refresh_token_expires_at DATETIME,
  date_created_user DATE DEFAULT (CURRENT_DATE),
  date_updated_user TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_staff_user) REFERENCES staffs(id_staff)
);

-- Create roles table
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create menus table
CREATE TABLE menus (
  id_menu INT PRIMARY KEY AUTO_INCREMENT,
  descripcion_corta_menu VARCHAR(20),
  descripcion_larga_menu VARCHAR(50),
  habilitado_menu TINYINT(1) DEFAULT 1,
  date_created_menu DATE DEFAULT (CURRENT_DATE),
  date_updated_menu TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create menu_user permissions table
CREATE TABLE mxusers (
  id_mxuser INT PRIMARY KEY AUTO_INCREMENT,
  id_menu_mxuser INT NOT NULL,
  id_user_mxuser INT NOT NULL,
  date_created_mxuser DATE DEFAULT (CURRENT_DATE),
  date_updated_mxuser TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_menu_mxuser) REFERENCES menus(id_menu) ON DELETE CASCADE,
  FOREIGN KEY (id_user_mxuser) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('user'), ('manager');