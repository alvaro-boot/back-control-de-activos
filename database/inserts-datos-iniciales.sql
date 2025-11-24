-- =============================================
--   INSERTS DE DATOS INICIALES
--   Control de Activos con QR Dinámico
-- =============================================
-- Ejecuta estos INSERTs después de crear las tablas
-- Orden: Roles → Empresa Sistema → Admin Sistema → Empresas → Sedes → Áreas → Empleados → Categorías → Activos → Usuarios
-- =============================================

-- =============================================
-- 1. ROLES (Solo usuarios del sistema, NO empleado)
-- =============================================
INSERT IGNORE INTO roles (id, nombre) VALUES 
    (1, 'administrador'), 
    (2, 'tecnico'), 
    (4, 'administrador_sistema');

-- =============================================
-- 2. EMPRESA SISTEMA (Para el administrador del sistema)
-- =============================================
INSERT IGNORE INTO empresas (id, nombre, nit) VALUES (1, 'Sistema', 'SISTEMA-001');

-- =============================================
-- 3. ADMINISTRADOR DEL SISTEMA
-- =============================================
SET @empresa_sistema_id = 1;
SET @rol_admin_sistema_id = (SELECT id FROM roles WHERE nombre = 'administrador_sistema' LIMIT 1);

DELETE FROM usuarios WHERE correo = 'admin@sistema.com' OR id = 1;

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
-- 4. EMPRESAS DE EJEMPLO
-- =============================================
INSERT IGNORE INTO empresas (id, nombre, nit, direccion, telefono, correo) VALUES
    (2, 'Empresa Ejemplo 1', '900123456-1', 'Calle 123 #45-67', '6012345678', 'contacto@empresa1.com'),
    (3, 'Empresa Ejemplo 2', '900234567-2', 'Avenida Principal 789', '6023456789', 'info@empresa2.com'),
    (4, 'Empresa Ejemplo 3', '900345678-3', 'Carrera 10 #20-30', '6034567890', 'ventas@empresa3.com');

-- =============================================
-- 5. SEDES
-- =============================================
INSERT IGNORE INTO sedes (id, empresa_id, nombre, direccion) VALUES
    (1, 2, 'Sede Principal', 'Calle 123 #45-67, Bogotá'),
    (2, 2, 'Sede Norte', 'Calle 100 #50-20, Bogotá'),
    (3, 3, 'Sede Central', 'Avenida Principal 789, Medellín'),
    (4, 4, 'Sede Sur', 'Carrera 10 #20-30, Cali');

-- =============================================
-- 6. ÁREAS
-- =============================================
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

-- =============================================
-- 7. EMPLEADOS (Solo datos, NO usuarios del sistema)
-- =============================================
INSERT IGNORE INTO empleados (id, empresa_id, area_id, nombre, cargo, correo, telefono) VALUES
    (1, 2, 1, 'Juan Pérez', 'Gerente General', 'juan.perez@empresa1.com', '3001234567'),
    (2, 2, 2, 'María García', 'Desarrolladora Senior', 'maria.garcia@empresa1.com', '3002345678'),
    (3, 2, 2, 'Carlos Rodríguez', 'Analista de Sistemas', 'carlos.rodriguez@empresa1.com', '3003456789'),
    (4, 2, 3, 'Ana López', 'Recursos Humanos', 'ana.lopez@empresa1.com', '3004567890'),
    (5, 3, 6, 'Pedro Martínez', 'Vendedor', 'pedro.martinez@empresa2.com', '3005678901'),
    (6, 3, 7, 'Laura Sánchez', 'Marketing Manager', 'laura.sanchez@empresa2.com', '3006789012'),
    (7, 4, 8, 'Roberto Torres', 'Operario', 'roberto.torres@empresa3.com', '3007890123'),
    (8, 4, 9, 'Carmen Ruiz', 'Control de Calidad', 'carmen.ruiz@empresa3.com', '3008901234');

-- =============================================
-- 8. CATEGORÍAS DE ACTIVOS
-- =============================================
INSERT IGNORE INTO categorias (id, empresa_id, nombre, descripcion) VALUES
    (1, 2, 'Equipos de Cómputo', 'Computadores, laptops, servidores'),
    (2, 2, 'Mobiliario', 'Escritorios, sillas, estanterías'),
    (3, 2, 'Equipos de Oficina', 'Impresoras, escáneres, fotocopiadoras'),
    (4, 3, 'Vehículos', 'Carros, motos, camiones'),
    (5, 3, 'Maquinaria', 'Equipos industriales'),
    (6, 4, 'Herramientas', 'Herramientas de trabajo'),
    (7, 4, 'Equipos Médicos', 'Equipos biomédicos');

-- =============================================
-- 9. ACTIVOS
-- =============================================
INSERT IGNORE INTO activos (id, empresa_id, codigo, nombre, descripcion, categoria_id, sede_id, area_id, responsable_id, fecha_compra, valor_compra, valor_actual, estado) VALUES
    (1, 2, 'EQ-001', 'Laptop Dell Latitude 5520', 'Laptop para desarrollo', 1, 1, 2, 2, '2024-01-15', 3500000, 3000000, 'activo'),
    (2, 2, 'EQ-002', 'Monitor LG UltraWide', 'Monitor 29 pulgadas', 1, 1, 2, 3, '2024-01-20', 1200000, 1000000, 'activo'),
    (3, 2, 'MOB-001', 'Escritorio Ejecutivo', 'Escritorio de madera', 2, 1, 1, 1, '2024-02-01', 800000, 750000, 'activo'),
    (4, 2, 'OFI-001', 'Impresora HP LaserJet', 'Impresora multifuncional', 3, 1, 1, 4, '2024-02-10', 1500000, 1400000, 'activo'),
    (5, 3, 'VEH-001', 'Camioneta Toyota Hilux', 'Vehículo de reparto', 4, 3, 6, 5, '2023-12-01', 120000000, 100000000, 'activo'),
    (6, 4, 'HER-001', 'Taladro Eléctrico', 'Taladro profesional', 6, 4, 8, 7, '2024-01-05', 350000, 300000, 'activo');

-- =============================================
-- 10. USUARIOS DEL SISTEMA (Administradores y Técnicos)
-- =============================================
INSERT IGNORE INTO usuarios (id, empresa_id, rol_id, nombre_completo, correo, contrasena, telefono, activo) VALUES
    (2, 2, 1, 'Admin Empresa 1', 'admin@empresa1.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3012345678', 1),
    (3, 2, 2, 'Técnico Empresa 1', 'tecnico@empresa1.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3023456789', 1),
    (4, 3, 1, 'Admin Empresa 2', 'admin@empresa2.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3034567890', 1),
    (5, 3, 2, 'Técnico Empresa 2', 'tecnico@empresa2.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3045678901', 1),
    (6, 4, 1, 'Admin Empresa 3', 'admin@empresa3.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '3056789012', 1);

-- =============================================
-- RESUMEN
-- =============================================
-- ✅ Roles: 3 (administrador, tecnico, administrador_sistema)
-- ✅ Empresas: 4 (1 Sistema + 3 Ejemplo)
-- ✅ Sedes: 4
-- ✅ Áreas: 9
-- ✅ Empleados: 8 (solo datos)
-- ✅ Categorías: 7
-- ✅ Activos: 6
-- ✅ Usuarios: 6 (1 admin sistema + 3 admins empresa + 2 técnicos)
--
-- Credenciales (todas con contraseña: admin123):
--   - admin@sistema.com (Administrador del Sistema)
--   - admin@empresa1.com (Admin Empresa 1)
--   - tecnico@empresa1.com (Técnico Empresa 1)
--   - admin@empresa2.com (Admin Empresa 2)
--   - tecnico@empresa2.com (Técnico Empresa 2)
--   - admin@empresa3.com (Admin Empresa 3)
-- =============================================

