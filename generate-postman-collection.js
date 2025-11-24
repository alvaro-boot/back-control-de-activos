const fs = require('fs');

const collection = {
  info: {
    name: 'Sistema de Control de Activos - API',
    description: 'Colección completa de endpoints para el Sistema de Control de Activos con QR Dinámico',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'base_url', value: 'http://localhost:3000', type: 'string' },
    { key: 'token', value: '', type: 'string' },
    { key: 'empresaId', value: '1', type: 'string' },
    { key: 'activoId', value: '1', type: 'string' },
    { key: 'empleadoId', value: '1', type: 'string' },
    { key: 'usuarioId', value: '1', type: 'string' }
  ],
  item: []
};

// Helper para crear requests con documentación mejorada
function createRequest(name, method, path, description, body = null, auth = true, roles = null, exampleResponse = null) {
  let fullDescription = description;
  
  if (roles) {
    fullDescription += `\n\n**Roles permitidos:** ${roles}`;
  }
  
  if (exampleResponse) {
    fullDescription += `\n\n**Ejemplo de respuesta:**\n\`\`\`json\n${JSON.stringify(exampleResponse, null, 2)}\n\`\`\``;
  }
  
  const request = {
    name,
    request: {
      method,
      header: auth ? [
        { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' },
        { key: 'Content-Type', value: 'application/json', type: 'text' }
      ] : [
        { key: 'Content-Type', value: 'application/json', type: 'text' }
      ],
      url: {
        raw: `{{base_url}}/api${path}`,
        host: ['{{base_url}}'],
        path: ['api', ...path.split('/').filter(p => p)]
      },
      description: {
        content: fullDescription,
        type: 'text/markdown'
      }
    }
  };
  
  if (body) {
    request.request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: { raw: { language: 'json' } }
    };
  }
  
  return request;
}

// Autenticación
collection.item.push({
  name: 'Autenticación',
  item: [
    createRequest('Login', 'POST', '/auth/login', 
      'Inicia sesión y obtiene tokens de acceso. Retorna accessToken y refreshToken que deben usarse en las siguientes peticiones.\n\n**Campos requeridos:**\n- `correo`: Email del usuario\n- `password`: Contraseña (mínimo 6 caracteres)\n\n**Nota:** El token se guarda automáticamente después de un login exitoso.',
      { correo: 'admin@empresa.com', password: 'password123' },
      false,
      null,
      {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          nombreCompleto: 'Admin',
          correo: 'admin@empresa.com',
          role: { nombre: 'administrador' },
          empresaId: 1
        }
      }
    ),
    createRequest('Registrar Usuario', 'POST', '/auth/register',
      'Registra un nuevo usuario en el sistema. Requiere datos básicos del usuario y empresa.',
      {
        empresaId: 1,
        rolId: 1,
        nombreCompleto: 'Juan Pérez',
        correo: 'juan@empresa.com',
        contrasena: 'password123',
        telefono: '3001234567',
        areaId: 1
      },
      false
    ),
    createRequest('Refrescar Token', 'POST', '/auth/refresh',
      'Obtiene un nuevo accessToken usando el refreshToken. Útil cuando el token expira.',
      { refreshToken: '{{refreshToken}}' },
      false
    )
  ]
});

// Usuarios
collection.item.push({
  name: 'Usuarios',
  item: [
    createRequest('Listar Usuarios', 'GET', '/usuarios',
      'Obtiene todos los usuarios. Los administradores ven todos, otros solo de su empresa.'
    ),
    createRequest('Obtener Usuario', 'GET', '/usuarios/:id',
      'Obtiene un usuario específico por su ID.'
    ),
    createRequest('Crear Usuario', 'POST', '/usuarios',
      'Crea un nuevo usuario. Solo administradores pueden crear usuarios.',
      {
        empresaId: 1,
        rolId: 2,
        nombreCompleto: 'Técnico',
        correo: 'tecnico@empresa.com',
        contrasena: 'password123',
        telefono: '3001234567',
        areaId: 1,
        activo: 1
      }
    ),
    createRequest('Actualizar Usuario', 'PATCH', '/usuarios/:id',
      'Actualiza los datos de un usuario existente.',
      { nombreCompleto: 'Juan Pérez Actualizado', telefono: '3001234568' }
    ),
    createRequest('Eliminar Usuario', 'DELETE', '/usuarios/:id',
      'Elimina un usuario del sistema. Solo administradores.'
    )
  ]
});

// Empresas
collection.item.push({
  name: 'Empresas',
  item: [
    createRequest('Listar Empresas', 'GET', '/empresas',
      'Obtiene todas las empresas. Solo administradores.'
    ),
    createRequest('Obtener Empresa', 'GET', '/empresas/:id',
      'Obtiene una empresa específica por su ID.'
    ),
    createRequest('Crear Empresa', 'POST', '/empresas',
      'Crea una nueva empresa en el sistema.',
      {
        nombre: 'Mi Empresa S.A.',
        nit: '123456789-1',
        direccion: 'Calle 123 #45-67',
        telefono: '3001234567',
        correo: 'contacto@empresa.com'
      }
    ),
    createRequest('Actualizar Empresa', 'PATCH', '/empresas/:id',
      'Actualiza los datos de una empresa.',
      { nombre: 'Mi Empresa S.A. Actualizada', telefono: '3001234568' }
    ),
    createRequest('Eliminar Empresa', 'DELETE', '/empresas/:id',
      'Elimina una empresa del sistema.'
    )
  ]
});

// Activos
collection.item.push({
  name: 'Activos',
  item: [
    createRequest('Listar Activos', 'GET', '/activos?empresaId=1',
      'Obtiene todos los activos. Puede filtrarse por empresaId.'
    ),
    createRequest('Obtener Activo', 'GET', '/activos/:id',
      'Obtiene un activo específico con toda su información, incluyendo relaciones.'
    ),
    createRequest('Crear Activo', 'POST', '/activos',
      'Crea un nuevo activo. Genera automáticamente un código QR único.',
      {
        empresaId: 1,
        codigo: 'ACT-001',
        nombre: 'Laptop Dell Latitude 5520',
        descripcion: 'Laptop empresarial para desarrollo',
        categoriaId: 1,
        sedeId: 1,
        areaId: 1,
        responsableId: 1,
        fechaCompra: '2024-01-15',
        valorCompra: 1500000,
        valorActual: 1350000,
        estado: 'activo'
      }
    ),
    createRequest('Actualizar Activo', 'PATCH', '/activos/:id',
      'Actualiza los datos de un activo existente.',
      { nombre: 'Laptop Dell Actualizada', valorActual: 1200000 }
    ),
    createRequest('Regenerar QR', 'POST', '/activos/:id/regenerar-qr',
      'Regenera el código QR de un activo. Útil si se perdió o necesita actualizarse.'
    ),
    createRequest('Eliminar Activo', 'DELETE', '/activos/:id',
      'Elimina un activo del sistema. Solo administradores.'
    )
  ]
});

// QR Público
collection.item.push({
  name: 'QR',
  item: [
    createRequest('Ver Activo desde QR', 'GET', '/qr/activo/:id',
      'Endpoint público para ver información del activo escaneando el QR. No requiere autenticación.',
      null,
      false
    )
  ]
});

// Asignaciones
collection.item.push({
  name: 'Asignaciones',
  item: [
    createRequest('Listar Asignaciones', 'GET', '/asignaciones?activoId=1&empleadoId=1',
      'Obtiene todas las asignaciones. Puede filtrarse por activoId o empleadoId.'
    ),
    createRequest('Obtener Asignación', 'GET', '/asignaciones/:id',
      'Obtiene una asignación específica por su ID.'
    ),
    createRequest('Crear Asignación', 'POST', '/asignaciones',
      'Asigna un activo a un empleado. El activo debe estar disponible.',
      {
        activoId: 1,
        empleadoId: 1,
        fechaAsignacion: '2024-01-15T10:00:00'
      }
    ),
    createRequest('Devolver Activo', 'PATCH', '/asignaciones/:id/devolver',
      'Marca una asignación como devuelta, cerrando el ciclo de asignación.',
      { fechaDevolucion: '2024-01-20T10:00:00' }
    ),
    createRequest('Historial por Activo', 'GET', '/asignaciones/historial/activo/:activoId',
      'Obtiene el historial completo de asignaciones de un activo específico.'
    ),
    createRequest('Historial por Empleado', 'GET', '/asignaciones/historial/empleado/:empleadoId',
      'Obtiene el historial completo de asignaciones de un empleado específico.'
    ),
    createRequest('Eliminar Asignación', 'DELETE', '/asignaciones/:id',
      'Elimina una asignación del sistema. Solo administradores.'
    )
  ]
});

// Mantenimientos
collection.item.push({
  name: 'Mantenimientos',
  item: [
    createRequest('Listar Mantenimientos', 'GET', '/mantenimientos?activoId=1&tecnicoId=1',
      'Obtiene todos los mantenimientos. Puede filtrarse por activoId o tecnicoId.'
    ),
    createRequest('Obtener Mantenimiento', 'GET', '/mantenimientos/:id',
      'Obtiene un mantenimiento específico por su ID.'
    ),
    createRequest('Crear Mantenimiento', 'POST', '/mantenimientos',
      'Crea un nuevo registro de mantenimiento para un activo.',
      {
        activoId: 1,
        tecnicoId: 2,
        tipo: 'preventivo',
        notas: 'Mantenimiento preventivo de limpieza y revisión general',
        fechaMantenimiento: '2024-02-15',
        costo: 50000
      }
    ),
    createRequest('Actualizar Mantenimiento', 'PATCH', '/mantenimientos/:id',
      'Actualiza los datos de un mantenimiento existente.',
      { notas: 'Mantenimiento completado', costo: 55000 }
    ),
    createRequest('Historial por Activo', 'GET', '/mantenimientos/historial/activo/:activoId',
      'Obtiene el historial completo de mantenimientos de un activo específico.'
    ),
    createRequest('Eliminar Mantenimiento', 'DELETE', '/mantenimientos/:id',
      'Elimina un mantenimiento del sistema. Solo administradores.'
    )
  ]
});

// Mantenimientos Programados
collection.item.push({
  name: 'Mantenimientos Programados',
  item: [
    createRequest('Listar Programados', 'GET', '/mantenimientos-programados?activoId=1&tecnicoId=1',
      'Obtiene todos los mantenimientos programados. Puede filtrarse por activoId o tecnicoId.'
    ),
    createRequest('Mantenimientos Próximos', 'GET', '/mantenimientos-programados/proximos?dias=7',
      'Obtiene los mantenimientos programados para los próximos N días (por defecto 7).'
    ),
    createRequest('Obtener Programado', 'GET', '/mantenimientos-programados/:id',
      'Obtiene un mantenimiento programado específico por su ID.'
    ),
    createRequest('Crear Programado', 'POST', '/mantenimientos-programados',
      'Crea un nuevo mantenimiento programado para un activo.',
      {
        activoId: 1,
        tecnicoId: 2,
        fechaProgramada: '2024-03-15',
        tipo: 'preventivo',
        descripcion: 'Mantenimiento preventivo mensual'
      }
    ),
    createRequest('Actualizar Programado', 'PATCH', '/mantenimientos-programados/:id',
      'Actualiza un mantenimiento programado existente.',
      { fechaProgramada: '2024-03-20', descripcion: 'Actualizado' }
    ),
    createRequest('Eliminar Programado', 'DELETE', '/mantenimientos-programados/:id',
      'Elimina un mantenimiento programado del sistema.'
    )
  ]
});

// Empleados
collection.item.push({
  name: 'Empleados',
  item: [
    createRequest('Listar Empleados', 'GET', '/empleados?empresaId=1',
      'Obtiene todos los empleados. Puede filtrarse por empresaId.'
    ),
    createRequest('Obtener Empleado', 'GET', '/empleados/:id',
      'Obtiene un empleado específico por su ID.'
    ),
    createRequest('Crear Empleado', 'POST', '/empleados',
      'Crea un nuevo empleado en el sistema.',
      {
        empresaId: 1,
        areaId: 1,
        nombre: 'Juan Pérez',
        cargo: 'Desarrollador',
        correo: 'juan@empresa.com',
        telefono: '3001234567'
      }
    ),
    createRequest('Actualizar Empleado', 'PATCH', '/empleados/:id',
      'Actualiza los datos de un empleado existente.',
      { nombre: 'Juan Pérez Actualizado', cargo: 'Desarrollador Senior' }
    ),
    createRequest('Eliminar Empleado', 'DELETE', '/empleados/:id',
      'Elimina un empleado del sistema. Solo administradores.'
    )
  ]
});

// Áreas
collection.item.push({
  name: 'Áreas',
  item: [
    createRequest('Listar Áreas', 'GET', '/areas?sedeId=1',
      'Obtiene todas las áreas. Puede filtrarse por sedeId.'
    ),
    createRequest('Obtener Área', 'GET', '/areas/:id',
      'Obtiene un área específica por su ID.'
    ),
    createRequest('Crear Área', 'POST', '/areas',
      'Crea una nueva área en el sistema.',
      { sedeId: 1, nombre: 'Recursos Humanos' }
    ),
    createRequest('Actualizar Área', 'PATCH', '/areas/:id',
      'Actualiza los datos de un área existente.',
      { nombre: 'Recursos Humanos Actualizado' }
    ),
    createRequest('Eliminar Área', 'DELETE', '/areas/:id',
      'Elimina un área del sistema. Solo administradores.'
    )
  ]
});

// Sedes
collection.item.push({
  name: 'Sedes',
  item: [
    createRequest('Listar Sedes', 'GET', '/sedes?empresaId=1',
      'Obtiene todas las sedes. Puede filtrarse por empresaId.'
    ),
    createRequest('Obtener Sede', 'GET', '/sedes/:id',
      'Obtiene una sede específica por su ID.'
    ),
    createRequest('Crear Sede', 'POST', '/sedes',
      'Crea una nueva sede en el sistema.',
      {
        empresaId: 1,
        nombre: 'Sede Principal',
        direccion: 'Calle 123 #45-67',
        telefono: '3001234567'
      }
    ),
    createRequest('Actualizar Sede', 'PATCH', '/sedes/:id',
      'Actualiza los datos de una sede existente.',
      { nombre: 'Sede Principal Actualizada' }
    ),
    createRequest('Eliminar Sede', 'DELETE', '/sedes/:id',
      'Elimina una sede del sistema. Solo administradores.'
    )
  ]
});

// Categorías
collection.item.push({
  name: 'Categorías',
  item: [
    createRequest('Listar Categorías', 'GET', '/categorias?empresaId=1',
      'Obtiene todas las categorías. Puede filtrarse por empresaId.'
    ),
    createRequest('Obtener Categoría', 'GET', '/categorias/:id',
      'Obtiene una categoría específica por su ID.'
    ),
    createRequest('Crear Categoría', 'POST', '/categorias',
      'Crea una nueva categoría en el sistema.',
      { empresaId: 1, nombre: 'Computadores', descripcion: 'Equipos de cómputo' }
    ),
    createRequest('Actualizar Categoría', 'PATCH', '/categorias/:id',
      'Actualiza los datos de una categoría existente.',
      { nombre: 'Computadores Actualizado' }
    ),
    createRequest('Eliminar Categoría', 'DELETE', '/categorias/:id',
      'Elimina una categoría del sistema. Solo administradores.'
    )
  ]
});

// Proveedores
collection.item.push({
  name: 'Proveedores',
  item: [
    createRequest('Listar Proveedores', 'GET', '/proveedores?empresaId=1',
      'Obtiene todos los proveedores. Puede filtrarse por empresaId.'
    ),
    createRequest('Obtener Proveedor', 'GET', '/proveedores/:id',
      'Obtiene un proveedor específico por su ID.'
    ),
    createRequest('Crear Proveedor', 'POST', '/proveedores',
      'Crea un nuevo proveedor en el sistema.',
      {
        empresaId: 1,
        nombre: 'Proveedor Tech S.A.',
        nit: '987654321-1',
        direccion: 'Calle 456 #78-90',
        telefono: '3009876543',
        correo: 'contacto@proveedor.com'
      }
    ),
    createRequest('Actualizar Proveedor', 'PATCH', '/proveedores/:id',
      'Actualiza los datos de un proveedor existente.',
      { nombre: 'Proveedor Tech Actualizado' }
    ),
    createRequest('Eliminar Proveedor', 'DELETE', '/proveedores/:id',
      'Elimina un proveedor del sistema. Solo administradores.'
    )
  ]
});

// Garantías
collection.item.push({
  name: 'Garantías',
  item: [
    createRequest('Listar Garantías', 'GET', '/garantias',
      'Obtiene todas las garantías del sistema.'
    ),
    createRequest('Garantía por Activo', 'GET', '/garantias/activo/:activoId',
      'Obtiene la garantía asociada a un activo específico.'
    ),
    createRequest('Obtener Garantía', 'GET', '/garantias/:id',
      'Obtiene una garantía específica por su ID.'
    ),
    createRequest('Crear Garantía', 'POST', '/garantias',
      'Crea una nueva garantía para un activo.',
      {
        activoId: 1,
        proveedorId: 1,
        fechaInicio: '2024-01-15',
        fechaFin: '2025-01-15',
        descripcion: 'Garantía de 1 año en partes y mano de obra'
      }
    ),
    createRequest('Actualizar Garantía', 'PATCH', '/garantias/:id',
      'Actualiza los datos de una garantía existente.',
      { descripcion: 'Garantía actualizada' }
    ),
    createRequest('Eliminar Garantía', 'DELETE', '/garantias/:id',
      'Elimina una garantía del sistema. Solo administradores.'
    )
  ]
});

// Historial de Activos
collection.item.push({
  name: 'Historial de Activos',
  item: [
    createRequest('Listar Historial', 'GET', '/historial-activos',
      'Obtiene todo el historial de cambios de activos.'
    ),
    createRequest('Historial por Activo', 'GET', '/historial-activos/activo/:activoId',
      'Obtiene el historial completo de cambios de un activo específico.'
    ),
    createRequest('Obtener Registro', 'GET', '/historial-activos/:id',
      'Obtiene un registro específico del historial por su ID.'
    ),
    createRequest('Crear Registro', 'POST', '/historial-activos',
      'Crea un nuevo registro en el historial de un activo.',
      {
        activoId: 1,
        usuarioId: 1,
        tipoCambio: 'actualizacion',
        descripcion: 'Se actualizó el valor del activo',
        responsableAnteriorId: 1,
        responsableNuevoId: 2
      }
    )
  ]
});

// Depreciación de Activos
collection.item.push({
  name: 'Depreciación de Activos',
  item: [
    createRequest('Listar Depreciaciones', 'GET', '/depreciacion-activos?activoId=1',
      'Obtiene todas las depreciaciones. Puede filtrarse por activoId.'
    ),
    createRequest('Obtener Depreciación', 'GET', '/depreciacion-activos/:id',
      'Obtiene una depreciación específica por su ID.'
    ),
    createRequest('Crear Depreciación', 'POST', '/depreciacion-activos',
      'Crea un nuevo registro de depreciación para un activo.',
      {
        activoId: 1,
        fechaCalculo: '2024-01-15',
        valorAnterior: 1500000,
        valorDepreciado: 1350000,
        porcentajeDepreciacion: 10,
        metodo: 'lineal'
      }
    ),
    createRequest('Actualizar Depreciación', 'PATCH', '/depreciacion-activos/:id',
      'Actualiza los datos de una depreciación existente.',
      { valorDepreciado: 1300000, porcentajeDepreciacion: 13.33 }
    ),
    createRequest('Eliminar Depreciación', 'DELETE', '/depreciacion-activos/:id',
      'Elimina una depreciación del sistema. Solo administradores.'
    )
  ]
});

// Activos-Proveedores
collection.item.push({
  name: 'Activos-Proveedores',
  item: [
    createRequest('Listar Relaciones', 'GET', '/activos-proveedores?activoId=1&proveedorId=1',
      'Obtiene todas las relaciones activo-proveedor. Puede filtrarse por activoId o proveedorId.'
    ),
    createRequest('Obtener Relación', 'GET', '/activos-proveedores/:id',
      'Obtiene una relación específica por su ID.'
    ),
    createRequest('Crear Relación', 'POST', '/activos-proveedores',
      'Crea una nueva relación entre un activo y un proveedor.',
      {
        activoId: 1,
        proveedorId: 1,
        fechaCompra: '2024-01-15',
        precioCompra: 1500000,
        numeroFactura: 'FAC-001'
      }
    ),
    createRequest('Actualizar Relación', 'PATCH', '/activos-proveedores/:id',
      'Actualiza los datos de una relación existente.',
      { precioCompra: 1450000 }
    ),
    createRequest('Eliminar Relación', 'DELETE', '/activos-proveedores/:id',
      'Elimina una relación activo-proveedor del sistema. Solo administradores.'
    )
  ]
});

// Agregar script para guardar token automáticamente después del login
collection.item[0].item[0].event = [{
  listen: 'test',
  script: {
    exec: [
      '// Verificar que la respuesta sea exitosa',
      'pm.test("Status code is 200", function () {',
      '    pm.response.to.have.status(200);',
      '});',
      '',
      '// Guardar tokens automáticamente',
      'if (pm.response.code === 200) {',
      '    const jsonData = pm.response.json();',
      '    if (jsonData.accessToken) {',
      '        pm.environment.set("token", jsonData.accessToken);',
      '        console.log("✅ Access token guardado automáticamente");',
      '    }',
      '    if (jsonData.refreshToken) {',
      '        pm.environment.set("refreshToken", jsonData.refreshToken);',
      '        console.log("✅ Refresh token guardado automáticamente");',
      '    }',
      '    if (jsonData.user) {',
      '        pm.environment.set("usuarioId", jsonData.user.id);',
      '        pm.environment.set("empresaId", jsonData.user.empresaId);',
      '    }',
      '}',
      '',
      '// Validar estructura de respuesta',
      'pm.test("Response has accessToken", function () {',
      '    const jsonData = pm.response.json();',
      '    pm.expect(jsonData).to.have.property("accessToken");',
      '});'
    ],
    type: 'text/javascript'
  }
}];

// Guardar archivo
fs.writeFileSync(
  'Control-de-Activos-API.postman_collection.json',
  JSON.stringify(collection, null, 2),
  'utf8'
);

console.log('✅ Colección de Postman creada exitosamente: Control-de-Activos-API.postman_collection.json');

