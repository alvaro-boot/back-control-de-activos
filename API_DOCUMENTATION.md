# 📚 Documentación de la API

## Autenticación

Todas las rutas (excepto las marcadas como públicas) requieren autenticación mediante JWT Bearer Token.

### Headers Requeridos

```
Authorization: Bearer {accessToken}
```

## Endpoints Públicos

### POST /api/auth/login
Iniciar sesión y obtener tokens.

**Body:**
```json
{
  "correo": "admin@empresa.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Admin",
    "correo": "admin@empresa.com",
    "role": "administrador",
    "empresaId": 1
  }
}
```

### POST /api/auth/register
Registrar nuevo usuario.

**Body:**
```json
{
  "empresaId": 1,
  "roleId": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@empresa.com",
  "password": "password123"
}
```

### POST /api/auth/refresh
Refrescar token de acceso.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/qr/activo/:id
Ver información del activo desde código QR (público, no requiere autenticación).

## Endpoints de Usuarios

### GET /api/usuarios
Listar todos los usuarios (filtrado por empresa si no es admin).

**Roles:** Todos

### GET /api/usuarios/:id
Obtener usuario por ID.

**Roles:** Todos

### POST /api/usuarios
Crear nuevo usuario.

**Roles:** administrador

**Body:**
```json
{
  "empresaId": 1,
  "roleId": 2,
  "nombre": "Técnico",
  "correo": "tecnico@empresa.com",
  "password": "password123",
  "activo": true
}
```

### PATCH /api/usuarios/:id
Actualizar usuario.

**Roles:** administrador

### DELETE /api/usuarios/:id
Eliminar usuario.

**Roles:** administrador

## Endpoints de Empresas

### GET /api/empresas
Listar todas las empresas.

**Roles:** administrador

### GET /api/empresas/:id
Obtener empresa por ID.

**Roles:** Todos

### POST /api/empresas
Crear nueva empresa.

**Roles:** administrador

**Body:**
```json
{
  "nombre": "Mi Empresa S.A.",
  "nit": "123456789-1",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "correo": "contacto@empresa.com"
}
```

### PATCH /api/empresas/:id
Actualizar empresa.

**Roles:** administrador

### DELETE /api/empresas/:id
Eliminar empresa.

**Roles:** administrador

## Endpoints de Áreas

### GET /api/areas
Listar áreas (filtrado por empresa).

**Query Params:**
- `empresaId` (opcional)

**Roles:** Todos

### GET /api/areas/:id
Obtener área por ID.

**Roles:** Todos

### POST /api/areas
Crear nueva área.

**Roles:** administrador

**Body:**
```json
{
  "empresaId": 1,
  "nombre": "Recursos Humanos"
}
```

### PATCH /api/areas/:id
Actualizar área.

**Roles:** administrador

### DELETE /api/areas/:id
Eliminar área.

**Roles:** administrador

## Endpoints de Empleados

### GET /api/empleados
Listar empleados (filtrado por empresa).

**Query Params:**
- `empresaId` (opcional)

**Roles:** Todos

### GET /api/empleados/:id
Obtener empleado por ID.

**Roles:** Todos

### POST /api/empleados
Crear nuevo empleado.

**Roles:** administrador

**Body:**
```json
{
  "empresaId": 1,
  "areaId": 1,
  "nombre": "Juan Pérez",
  "cargo": "Desarrollador",
  "correo": "juan@empresa.com",
  "telefono": "3001234567"
}
```

### PATCH /api/empleados/:id
Actualizar empleado.

**Roles:** administrador

### DELETE /api/empleados/:id
Eliminar empleado.

**Roles:** administrador

## Endpoints de Activos

### GET /api/activos
Listar activos (filtrado por empresa).

**Query Params:**
- `empresaId` (opcional)

**Roles:** Todos

### GET /api/activos/:id
Obtener activo por ID.

**Roles:** Todos

### POST /api/activos
Crear nuevo activo (genera QR automáticamente).

**Roles:** administrador, tecnico

**Body:**
```json
{
  "empresaId": 1,
  "nombre": "Laptop Dell",
  "tipo": "Computador",
  "marca": "Dell",
  "modelo": "Latitude 5520",
  "numeroSerie": "SN123456789",
  "valor": 1500000,
  "fechaCompra": "2024-01-15",
  "estado": "operativo"
}
```

**Estados:** `operativo`, `mantenimiento`, `baja`

### PATCH /api/activos/:id
Actualizar activo.

**Roles:** administrador, tecnico

### DELETE /api/activos/:id
Eliminar activo.

**Roles:** administrador

### POST /api/activos/:id/regenerar-qr
Regenerar código QR del activo.

**Roles:** administrador, tecnico

## Endpoints de Asignaciones

### GET /api/asignaciones
Listar asignaciones.

**Query Params:**
- `activoId` (opcional)
- `empleadoId` (opcional)

**Roles:** Todos

### GET /api/asignaciones/:id
Obtener asignación por ID.

**Roles:** Todos

### POST /api/asignaciones
Asignar activo a empleado.

**Roles:** administrador, tecnico

**Body:**
```json
{
  "activoId": 1,
  "empleadoId": 1,
  "fechaAsignacion": "2024-01-15T10:00:00"
}
```

**Validaciones:**
- No se puede asignar un activo ya asignado
- Debe cerrar la asignación anterior antes de iniciar otra

### PATCH /api/asignaciones/:id/devolver
Devolver activo asignado.

**Roles:** administrador, tecnico

**Body:**
```json
{
  "fechaDevolucion": "2024-01-20T10:00:00"
}
```

### GET /api/asignaciones/historial/activo/:activoId
Obtener historial completo de asignaciones de un activo.

**Roles:** Todos

### GET /api/asignaciones/historial/empleado/:empleadoId
Obtener historial completo de asignaciones de un empleado.

**Roles:** Todos

### DELETE /api/asignaciones/:id
Eliminar asignación.

**Roles:** administrador

## Endpoints de Mantenimientos

### GET /api/mantenimientos
Listar mantenimientos.

**Query Params:**
- `activoId` (opcional)
- `tecnicoId` (opcional)

**Roles:** Todos

### GET /api/mantenimientos/:id
Obtener mantenimiento por ID.

**Roles:** Todos

### POST /api/mantenimientos
Crear nuevo mantenimiento.

**Roles:** administrador, tecnico

**Body:**
```json
{
  "activoId": 1,
  "tecnicoId": 2,
  "descripcion": "Mantenimiento preventivo de limpieza",
  "fechaProgramada": "2024-02-15",
  "estado": "programado"
}
```

**Estados:** `programado`, `en_progreso`, `completado`

### PATCH /api/mantenimientos/:id
Actualizar mantenimiento.

**Roles:** administrador, tecnico

**Body:**
```json
{
  "estado": "completado",
  "fechaRealizacion": "2024-02-16"
}
```

### GET /api/mantenimientos/proximos
Obtener mantenimientos próximos (próximos 7 días por defecto).

**Query Params:**
- `dias` (opcional, default: 7)

**Roles:** Todos

### GET /api/mantenimientos/historial/activo/:activoId
Obtener historial completo de mantenimientos de un activo.

**Roles:** Todos

### DELETE /api/mantenimientos/:id
Eliminar mantenimiento.

**Roles:** administrador

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Solicitud inválida
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado (rol insuficiente)
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Ejemplos de Uso

### Flujo Completo: Crear Activo y Asignarlo

1. **Crear activo:**
```bash
POST /api/activos
Authorization: Bearer {token}
{
  "empresaId": 1,
  "nombre": "Laptop Dell",
  "tipo": "Computador",
  "marca": "Dell",
  "modelo": "Latitude 5520",
  "numeroSerie": "SN123456789",
  "valor": 1500000,
  "fechaCompra": "2024-01-15",
  "estado": "operativo"
}
```

2. **Asignar a empleado:**
```bash
POST /api/asignaciones
Authorization: Bearer {token}
{
  "activoId": 1,
  "empleadoId": 1
}
```

3. **Ver QR del activo:**
```
GET /api/qr/activo/1
(No requiere autenticación)
```

4. **Programar mantenimiento:**
```bash
POST /api/mantenimientos
Authorization: Bearer {token}
{
  "activoId": 1,
  "tecnicoId": 2,
  "descripcion": "Limpieza y revisión general",
  "fechaProgramada": "2024-02-15"
}
```

5. **Devolver activo:**
```bash
PATCH /api/asignaciones/1/devolver
Authorization: Bearer {token}
{
  "fechaDevolucion": "2024-01-20T10:00:00"
}
```

## Notas Importantes

1. **Multitenant**: Los usuarios no administradores solo ven recursos de su empresa.

2. **Validaciones**:
   - No se puede asignar un activo ya asignado
   - Los correos deben ser únicos
   - Los NIT de empresas deben ser únicos

3. **QR Dinámico**: Se genera automáticamente al crear un activo. La URL es: `{QR_BASE_URL}/{activoId}`

4. **Historial**: Todos los activos mantienen historial completo de asignaciones y mantenimientos.

5. **Cron Jobs**: El sistema revisa diariamente los mantenimientos próximos a las 9:00 AM.

