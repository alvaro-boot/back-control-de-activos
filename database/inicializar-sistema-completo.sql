-- =============================================
--   INICIALIZACIÓN COMPLETA DEL SISTEMA
--   Control de Activos con QR Dinámico
-- =============================================
-- Este script crea:
--   1. Todas las tablas del sistema
--   2. Los roles por defecto (sin empleado como usuario)
--   3. El usuario Administrador del Sistema
--   4. Datos iniciales de ejemplo
-- =============================================

-- =============================================
-- 1. EMPRESAS
-- =============================================
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. ROLES
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Insertar roles por defecto (NO incluye empleado como usuario del sistema)
INSERT IGNORE INTO roles (id, nombre) VALUES 
    (1, 'administrador'), 
    (2, 'tecnico'), 
    (4, 'administrador_sistema');

-- =============================================
-- 3. SEDES
-- =============================================
CREATE TABLE IF NOT EXISTS sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- =============================================
-- 4. AREAS
-- =============================================
CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sede_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

-- =============================================
-- 5. USUARIOS
-- =============================================
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

-- =============================================
-- 6. EMPLEADOS (Solo datos, NO usuarios del sistema)
-- =============================================
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

-- =============================================
-- 7. CATEGORÍAS DE ACTIVOS
-- =============================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- =============================================
-- 8. ACTIVOS
-- =============================================
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

-- =============================================
-- 9. ASIGNACIONES
-- =============================================
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

-- =============================================
-- 10. CÓDIGOS QR
-- =============================================
CREATE TABLE IF NOT EXISTS activos_qr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL UNIQUE,
    contenido_qr TEXT NOT NULL,
    url_imagen_qr TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- =============================================
-- 11. HISTORIAL DE ACTIVOS
-- =============================================
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

-- =============================================
-- 12. MANTENIMIENTOS EJECUTADOS
-- =============================================
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

-- =============================================
-- 13. MANTENIMIENTOS PROGRAMADOS
-- =============================================
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

-- =============================================
-- 14. GARANTÍAS
-- =============================================
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

-- =============================================
-- 15. PROVEEDORES
-- =============================================
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150),
    telefono VARCHAR(20),
    direccion TEXT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- =============================================
-- 16. RELACIÓN ACTIVO ↔ PROVEEDOR
-- =============================================
CREATE TABLE IF NOT EXISTS activos_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    numero_factura VARCHAR(120),
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- =============================================
-- 17. DEPRECIACIÓN DE ACTIVOS
-- =============================================
CREATE TABLE IF NOT EXISTS depreciacion_activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activo_id INT NOT NULL,
    anio INT NOT NULL,
    valor_depreciado DECIMAL(12,2),
    valor_restante DECIMAL(12,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activo_id) REFERENCES activos(id) ON DELETE CASCADE
);

-- =============================================
-- 18. SOLICITUDES (Traslados, Bajas, Repuestos)
-- =============================================
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

-- =============================================
-- 19. NOTIFICACIONES
-- =============================================
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

-- =============================================
-- 20. INVENTARIO FÍSICO
-- =============================================
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

-- =============================================
-- CREAR ADMINISTRADOR DEL SISTEMA
-- =============================================

-- 1. Crear empresa "Sistema" para el administrador del sistema
INSERT IGNORE INTO empresas (id, nombre, nit) VALUES (1, 'Sistema', 'SISTEMA-001');

-- 2. Obtener IDs necesarios
SET @empresa_sistema_id = 1;
SET @rol_admin_sistema_id = (SELECT id FROM roles WHERE nombre = 'administrador_sistema' LIMIT 1);

-- 3. Eliminar el usuario admin del sistema si ya existe (para recrearlo)
DELETE FROM usuarios WHERE correo = 'admin@sistema.com' OR id = 1;

-- 4. Crear el usuario Administrador del Sistema
--    Contraseña: admin123
--    Hash bcrypt: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO usuarios (
    id,
    empresa_id,
    rol_id,
    nombre_completo,
    correo,
    contrasena,
    telefono,
    activo,
    creado_en
) VALUES (
    1,
    @empresa_sistema_id,
    @rol_admin_sistema_id,
    'Administrador del Sistema',
    'admin@sistema.com',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    NULL,
    1,
    NOW()
);

-- =============================================
-- DATOS INICIALES DE EJEMPLO
-- =============================================

-- Crear empresas de ejemplo
INSERT IGNORE INTO empresas (id, nombre, nit, direccion, telefono, correo) VALUES
    (2, 'Empresa Ejemplo 1', '900123456-1', 'Calle 123 #45-67', '6012345678', 'contacto@empresa1.com'),
    (3, 'Empresa Ejemplo 2', '900234567-2', 'Avenida Principal 789', '6023456789', 'info@empresa2.com'),
    (4, 'Empresa Ejemplo 3', '900345678-3', 'Carrera 10 #20-30', '6034567890', 'ventas@empresa3.com');

-- Crear sedes para las empresas
INSERT IGNORE INTO sedes (id, empresa_id, nombre, direccion) VALUES
    (1, 2, 'Sede Principal', 'Calle 123 #45-67, Bogotá'),
    (2, 2, 'Sede Norte', 'Calle 100 #50-20, Bogotá'),
    (3, 3, 'Sede Central', 'Avenida Principal 789, Medellín'),
    (4, 4, 'Sede Sur', 'Carrera 10 #20-30, Cali');

-- Crear áreas para las sedes
INSERT IGNORE INTO areas (id, sede_id, nombre) VALUES
    (1, 1, 'Administración'),
    (2, 1, 'Tecnología'),
    (3, 1, 'Recursos Humanos'),
    (4, 2, 'Producción'),
    (5, 2, 'Logística'),
    (6, 3, 'Ventas'),
    (7, 3, 'Marketing'),
    (8, 4, 'Operaciones'),
    (9, 4, 'Calidad');

-- Crear empleados (solo datos, NO usuarios del sistema)
INSERT IGNORE INTO empleados (id, empresa_id, area_id, nombre, cargo, correo, telefono) VALUES
    (1, 2, 1, 'Juan Pérez', 'Gerente General', 'juan.perez@empresa1.com', '3001234567'),
    (2, 2, 2, 'María García', 'Desarrolladora Senior', 'maria.garcia@empresa1.com', '3002345678'),
    (3, 2, 2, 'Carlos Rodríguez', 'Analista de Sistemas', 'carlos.rodriguez@empresa1.com', '3003456789'),
    (4, 2, 3, 'Ana López', 'Recursos Humanos', 'ana.lopez@empresa1.com', '3004567890'),
    (5, 3, 6, 'Pedro Martínez', 'Vendedor', 'pedro.martinez@empresa2.com', '3005678901'),
    (6, 3, 7, 'Laura Sánchez', 'Marketing Manager', 'laura.sanchez@empresa2.com', '3006789012'),
    (7, 4, 8, 'Roberto Torres', 'Operario', 'roberto.torres@empresa3.com', '3007890123'),
    (8, 4, 9, 'Carmen Ruiz', 'Control de Calidad', 'carmen.ruiz@empresa3.com', '3008901234');

-- Crear categorías de activos
INSERT IGNORE INTO categorias (id, empresa_id, nombre, descripcion) VALUES
    (1, 2, 'Equipos de Cómputo', 'Computadores, laptops, servidores'),
    (2, 2, 'Mobiliario', 'Escritorios, sillas, estanterías'),
    (3, 2, 'Equipos de Oficina', 'Impresoras, escáneres, fotocopiadoras'),
    (4, 3, 'Vehículos', 'Carros, motos, camiones'),
    (5, 3, 'Maquinaria', 'Equipos industriales'),
    (6, 4, 'Herramientas', 'Herramientas de trabajo'),
    (7, 4, 'Equipos Médicos', 'Equipos biomédicos');

-- Crear algunos activos de ejemplo
INSERT IGNORE INTO activos (id, empresa_id, codigo, nombre, descripcion, categoria_id, sede_id, area_id, responsable_id, fecha_compra, valor_compra, valor_actual, estado) VALUES
    (1, 2, 'EQ-001', 'Laptop Dell Latitude 5520', 'Laptop para desarrollo', 1, 1, 2, 2, '2024-01-15', 3500000, 3000000, 'activo'),
    (2, 2, 'EQ-002', 'Monitor LG UltraWide', 'Monitor 29 pulgadas', 1, 1, 2, 3, '2024-01-20', 1200000, 1000000, 'activo'),
    (3, 2, 'MOB-001', 'Escritorio Ejecutivo', 'Escritorio de madera', 2, 1, 1, 1, '2024-02-01', 800000, 750000, 'activo'),
    (4, 2, 'OFI-001', 'Impresora HP LaserJet', 'Impresora multifuncional', 3, 1, 1, 4, '2024-02-10', 1500000, 1400000, 'activo'),
    (5, 3, 'VEH-001', 'Camioneta Toyota Hilux', 'Vehículo de reparto', 4, 3, 6, 5, '2023-12-01', 120000000, 100000000, 'activo'),
    (6, 4, 'HER-001', 'Taladro Eléctrico', 'Taladro profesional', 6, 4, 8, 7, '2024-01-05', 350000, 300000, 'activo');

-- Crear usuarios administradores y técnicos para las empresas
-- (NO empleados, estos son usuarios del sistema)
INSERT IGNORE INTO usuarios (id, empresa_id, rol_id, nombre_completo, correo, contrasena, telefono, activo) VALUES
    (2, 2, 1, 'Admin Empresa 1', 'admin@empresa1.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3012345678', 1),
    (3, 2, 2, 'Técnico Empresa 1', 'tecnico@empresa1.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3023456789', 1),
    (4, 3, 1, 'Admin Empresa 2', 'admin@empresa2.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3034567890', 1),
    (5, 3, 2, 'Técnico Empresa 2', 'tecnico@empresa2.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3045678901', 1),
    (6, 4, 1, 'Admin Empresa 3', 'admin@empresa3.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3056789012', 1);

-- =============================================
-- RESUMEN
-- =============================================
-- ✅ Todas las tablas han sido creadas
-- ✅ Los roles han sido insertados (administrador, tecnico, administrador_sistema)
-- ✅ El Administrador del Sistema ha sido creado
-- ✅ Datos de ejemplo: 3 empresas, 4 sedes, 9 áreas, 8 empleados, 7 categorías, 6 activos
-- ✅ Usuarios de ejemplo: 1 admin sistema + 3 admins empresa + 2 técnicos
--
-- Credenciales del Administrador del Sistema:
--   Email: admin@sistema.com
--   Contraseña: admin123
--   ID: 1
--
-- Credenciales de ejemplo (todas con contraseña: admin123):
--   Admin Empresa 1: admin@empresa1.com
--   Técnico Empresa 1: tecnico@empresa1.com
--   Admin Empresa 2: admin@empresa2.com
--   Técnico Empresa 2: tecnico@empresa2.com
--   Admin Empresa 3: admin@empresa3.com
--
-- ⚠️ IMPORTANTE: Cambia todas las contraseñas después del primer inicio de sesión
-- =============================================

SELECT 
    'Sistema inicializado correctamente' AS mensaje,
    'admin@sistema.com' AS email_admin_sistema,
    'admin123' AS password_admin_sistema,
    (SELECT COUNT(*) FROM roles) AS total_roles,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM empresas) AS total_empresas,
    (SELECT COUNT(*) FROM empleados) AS total_empleados,
    (SELECT COUNT(*) FROM activos) AS total_activos;

