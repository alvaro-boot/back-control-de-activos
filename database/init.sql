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
INSERT IGNORE INTO roles (nombre) VALUES 
    ('administrador'), 
    ('tecnico'), 
    ('empleado'),
    ('administrador_sistema');

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

-- 6. EMPLEADOS
CREATE TABLE IF NOT EXISTS empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    area_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    correo VARCHAR(150) UNIQUE,
    telefono VARCHAR(50),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
);

-- 7. CATEGORÍAS DE ACTIVOS
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 8. ACTIVOS
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
    FOREIGN KEY (responsable_id) REFERENCES empleados(id) ON DELETE SET NULL
);

-- 9. ASIGNACIONES
CREATE TABLE IF NOT EXISTS asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    empleado_id INT NOT NULL,
    entregado_por INT NOT NULL,
    recibido_por INT,
    fecha_asignacion DATETIME NOT NULL,
    fecha_devolucion DATETIME,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (entregado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (recibido_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 10. CÓDIGOS QR
CREATE TABLE IF NOT EXISTS activos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL UNIQUE,
    contenido_qr TEXT NOT NULL,
    url_imagen_qr TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- 11. HISTORIAL DE ACTIVOS
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

-- 12. MANTENIMIENTOS EJECUTADOS
CREATE TABLE IF NOT EXISTS mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    tipo ENUM('preventivo', 'correctivo') NOT NULL,
    estado ENUM('pendiente', 'iniciado', 'pausado', 'finalizado') DEFAULT 'pendiente',
    notas TEXT,
    informe_tecnico TEXT,
    fecha_mantenimiento DATE NOT NULL,
    fecha_inicio DATETIME,
    fecha_finalizacion DATETIME,
    tiempo_intervencion INT,
    repuestos_utilizados TEXT,
    costo DECIMAL(12,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- 13. MANTENIMIENTOS PROGRAMADOS
CREATE TABLE IF NOT EXISTS mantenimientos_programados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    tecnico_id INT,
    fecha_programada DATE NOT NULL,
    estado ENUM('pendiente', 'realizado', 'cancelado') DEFAULT 'pendiente',
    descripcion TEXT NULL,
    tareas JSON NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 14. GARANTÍAS
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

-- 15. PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 16. RELACIÓN ACTIVO ↔ PROVEEDOR
CREATE TABLE IF NOT EXISTS activos_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    numero_factura VARCHAR(120),
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- 17. DEPRECIACIÓN DE ACTIVOS
CREATE TABLE IF NOT EXISTS depreciacion_activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    anio INT NOT NULL,
    valor_depreciado DECIMAL(12,2),
    valor_restante DECIMAL(12,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- 18. SOLICITUDES (Traslados, Bajas, Repuestos)
CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('traslado', 'baja', 'repuesto', 'mantenimiento') NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada', 'completada') DEFAULT 'pendiente',
    activo_id INT,
    solicitante_id INT NOT NULL,
    aprobado_por_id INT,
    motivo TEXT NOT NULL,
    observaciones TEXT,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion DATETIME,
    sede_origen_id INT,
    sede_destino_id INT,
    area_origen_id INT,
    area_destino_id INT,
    repuesto_nombre VARCHAR(200),
    repuesto_cantidad INT,
    repuesto_descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (aprobado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_origen_id) REFERENCES sedes(id) ON DELETE SET NULL,
    FOREIGN KEY (sede_destino_id) REFERENCES sedes(id) ON DELETE SET NULL,
    FOREIGN KEY (area_origen_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (area_destino_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- 19. NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('solicitud', 'mantenimiento', 'asignacion', 'alerta', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    estado ENUM('no_leida', 'leida') DEFAULT 'no_leida',
    url VARCHAR(500),
    referencia_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 20. INVENTARIO FÍSICO
CREATE TABLE IF NOT EXISTS inventario_fisico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_inventario DATE NOT NULL,
    confirmado BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    ubicacion_verificada VARCHAR(200),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- 21. TOKENS DE RECUPERACIÓN DE CONTRASEÑA
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expires_at (expires_at)
);
