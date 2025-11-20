-- =============================================
--   CREACIÓN DE LA BASE DE DATOS COMPLETA
--   SISTEMA DE CONTROL DE ACTIVOS CON QR
-- =============================================

-- 0. CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS control_activos;
USE control_activos;

-- 1. EMPRESAS
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar roles por defecto
INSERT IGNORE INTO roles (nombre) VALUES ('administrador'), ('tecnico'), ('empleado');

-- 3. SEDES
CREATE TABLE IF NOT EXISTS sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 4. AREAS
CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sede_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

-- 5. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    rol_id INT NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena TEXT NOT NULL,
    telefono VARCHAR(20),
    area_id INT NULL,
    activo TINYINT DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- 6. CATEGORÍAS DE ACTIVOS
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 7. ACTIVOS
CREATE TABLE IF NOT EXISTS activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria_id INT,
    sede_id INT,
    area_id INT,
    responsable_id INT,
    fecha_compra DATE,
    valor_compra DECIMAL(12,2),
    valor_actual DECIMAL(12,2),
    estado ENUM('activo', 'mantenimiento', 'retirado', 'perdido') DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 8. CÓDIGOS QR
CREATE TABLE IF NOT EXISTS activos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL UNIQUE,
    contenido_qr TEXT NOT NULL,
    url_imagen_qr TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- 9. HISTORIAL DE ACTIVOS
CREATE TABLE IF NOT EXISTS historial_activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    responsable_anterior INT,
    responsable_nuevo INT,
    area_anterior INT,
    area_nueva INT,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (responsable_anterior) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (responsable_nuevo) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (area_anterior) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (area_nueva) REFERENCES areas(id) ON DELETE SET NULL
);

-- 10. MANTENIMIENTOS EJECUTADOS
CREATE TABLE IF NOT EXISTS mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    tipo ENUM('preventivo', 'correctivo') NOT NULL,
    notas TEXT,
    fecha_mantenimiento DATE NOT NULL,
    costo DECIMAL(12,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- 11. MANTENIMIENTOS PROGRAMADOS
CREATE TABLE IF NOT EXISTS mantenimientos_programados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    tecnico_id INT,
    fecha_programada DATE NOT NULL,
    estado ENUM('pendiente', 'realizado', 'cancelado') DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 12. GARANTÍAS
CREATE TABLE IF NOT EXISTS garantias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL UNIQUE,
    proveedor VARCHAR(150),
    fecha_inicio DATE,
    fecha_fin DATE,
    numero_contrato VARCHAR(100),
    correo_contacto VARCHAR(150),
    telefono_contacto VARCHAR(20),
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- 13. PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 14. RELACIÓN ACTIVO ↔ PROVEEDOR
CREATE TABLE IF NOT EXISTS activos_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    numero_factura VARCHAR(120),
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- 15. DEPRECIACIÓN DE ACTIVOS
CREATE TABLE IF NOT EXISTS depreciacion_activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    anio INT NOT NULL,
    valor_depreciado DECIMAL(12,2),
    valor_restante DECIMAL(12,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);
