# 🔐 Sistema de Permisos y Filtrado por Empresa

Este documento explica cómo funciona el sistema de permisos y filtrado de datos por empresa en el Sistema de Control de Activos.

## 📋 Resumen

- **Administrador del Sistema**: Puede ver y gestionar **TODAS** las empresas y sus datos
- **Usuarios Normales**: Solo pueden ver y gestionar datos de **SU EMPRESA** específica

## 👤 Roles del Sistema

### 1. `administrador_sistema`
- **Acceso**: Global (todas las empresas)
- **Puede**:
  - Ver todas las empresas
  - Ver todos los activos de todas las empresas
  - Ver todos los empleados de todas las empresas
  - Ver todos los mantenimientos de todas las empresas
  - Ver todas las asignaciones de todas las empresas
  - Filtrar por empresa específica (opcional)
- **No puede**: Ser restringido por empresa

### 2. `administrador`
- **Acceso**: Solo su empresa
- **Puede**: Gestionar todo dentro de su empresa

### 3. `tecnico`
- **Acceso**: Solo su empresa
- **Puede**: Ver y gestionar mantenimientos de su empresa

### 4. `empleado`
- **Acceso**: Solo su empresa
- **Puede**: Ver información limitada de su empresa

## 🔧 Implementación Técnica

### Backend

#### Helper: `AdminSistemaUtil`

Ubicación: `src/common/utils/admin-sistema.util.ts`

```typescript
// Verifica si un usuario es administrador del sistema
static isAdminSistema(user: any): boolean {
  return user?.rol?.nombre === 'administrador_sistema';
}

// Obtiene el filtro de empresaId según el rol
static getEmpresaIdFilter(user: any, empresaIdQuery?: string | number): number | undefined {
  // Si es admin del sistema, puede ver todo (undefined = sin filtro)
  if (this.isAdminSistema(user)) {
    return empresaIdQuery ? Number(empresaIdQuery) : undefined;
  }
  
  // Usuarios normales: solo su empresa
  return user?.empresaId;
}
```

#### Controladores

Todos los controladores usan `AdminSistemaUtil.getEmpresaIdFilter()`:

```typescript
@Get()
findAll(
  @Query('empresaId') empresaId?: string,
  @CurrentUser() user?: any,
) {
  const empresaIdFilter = AdminSistemaUtil.getEmpresaIdFilter(user, empresaId);
  return this.service.findAll(empresaIdFilter);
}
```

#### Servicios

Los servicios filtran por `empresaId` cuando se proporciona:

```typescript
async findAll(empresaId?: number): Promise<Activo[]> {
  const where = empresaId ? { empresaId } : {};
  return this.repository.find({ where, relations: [...] });
}
```

### Frontend

#### Helper: `isSystemAdmin()`

Ubicación: `front-end/lib/auth.ts`

```typescript
export const isSystemAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role?.nombre === 'administrador_sistema';
};
```

#### Páginas con Filtro de Empresa

Las siguientes páginas muestran un selector de empresa **solo para admin del sistema**:

- `/activos` - Lista de activos
- `/empleados` - Lista de empleados
- `/mantenimientos` - Lista de mantenimientos

```typescript
// Solo muestra selector si es admin del sistema
{isAdmin && (
  <select
    value={selectedEmpresaId || ''}
    onChange={(e) => setSelectedEmpresaId(e.target.value ? Number(e.target.value) : undefined)}
  >
    <option value="">Todas las empresas</option>
    {empresas.map((empresa) => (
      <option key={empresa.id} value={empresa.id}>
        {empresa.nombre}
      </option>
    ))}
  </select>
)}
```

#### Llamadas API

El frontend **NO envía** `empresaId` para usuarios normales:

```typescript
// Solo envía empresaId si es admin y ha seleccionado una empresa
const empresaId = isAdmin ? selectedEmpresaId : undefined;
const data = await api.getActivos(empresaId);
```

## 📊 Tabla de Accesos

| Recurso | Admin Sistema | Usuario Normal |
|---------|--------------|----------------|
| **Empresas** | ✅ Todas | ❌ No accesible |
| **Activos** | ✅ Todos | ✅ Solo su empresa |
| **Empleados** | ✅ Todos | ✅ Solo su empresa |
| **Usuarios** | ✅ Todos | ✅ Solo su empresa |
| **Mantenimientos** | ✅ Todos | ✅ Solo su empresa |
| **Asignaciones** | ✅ Todas | ✅ Solo su empresa |
| **Categorías** | ✅ Todas | ✅ Solo su empresa |
| **Sedes** | ✅ Todas | ✅ Solo su empresa |
| **Áreas** | ✅ Todas | ✅ Solo su empresa |
| **Proveedores** | ✅ Todos | ✅ Solo su empresa |

## 🔒 Protección de Rutas

### Backend

#### RolesGuard
El `RolesGuard` permite que el administrador del sistema acceda a todos los endpoints:

```typescript
// El administrador del sistema tiene acceso a todo
if (user?.rol?.nombre === 'administrador_sistema') {
  return true;
}
```

#### Ruta de Empresas
Solo accesible para `administrador_sistema`:

```typescript
@Get()
@Roles('administrador_sistema')
findAll() {
  return this.empresasService.findAll();
}
```

### Frontend

#### Layout
Oculta opciones según el rol:

```typescript
// Ocultar opciones solo para admin del sistema si el usuario no es admin
if (item.adminOnly && !isSystemAdmin()) {
  return null;
}
```

#### ProtectedRoute
Protege rutas específicas:

```typescript
<ProtectedRoute allowedRoles={['administrador_sistema']}>
  <EmpresasPage />
</ProtectedRoute>
```

## 🧪 Casos de Uso

### Caso 1: Admin del Sistema ve todas las empresas

1. Usuario: `admin@sistema.com` (rol: `administrador_sistema`)
2. Hace petición: `GET /api/activos`
3. Backend: `AdminSistemaUtil.getEmpresaIdFilter()` retorna `undefined`
4. Servicio: `findAll(undefined)` → retorna todos los activos
5. Frontend: Muestra selector de empresa para filtrar

### Caso 2: Usuario Normal ve solo su empresa

1. Usuario: `admin@techsolutions.com` (rol: `administrador`, empresaId: 1)
2. Hace petición: `GET /api/activos`
3. Backend: `AdminSistemaUtil.getEmpresaIdFilter()` retorna `1`
4. Servicio: `findAll(1)` → retorna solo activos de empresa 1
5. Frontend: No muestra selector de empresa

### Caso 3: Admin del Sistema filtra por empresa específica

1. Usuario: `admin@sistema.com` (rol: `administrador_sistema`)
2. Frontend: Selecciona empresa "Tech Solutions" (ID: 1)
3. Hace petición: `GET /api/activos?empresaId=1`
4. Backend: `AdminSistemaUtil.getEmpresaIdFilter(user, "1")` retorna `1`
5. Servicio: `findAll(1)` → retorna solo activos de empresa 1

## ✅ Verificación

Para verificar que el sistema funciona correctamente:

### 1. Verificar rol en base de datos

```sql
SELECT u.id, u.nombre_completo, u.correo, r.nombre as rol
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
WHERE u.correo = 'admin@sistema.com';
```

Debería mostrar: `rol = 'administrador_sistema'`

### 2. Probar endpoints

**Como Admin del Sistema:**
```bash
# Debe retornar TODOS los activos
GET /api/activos
Authorization: Bearer <token_admin_sistema>

# Debe retornar activos de empresa 1
GET /api/activos?empresaId=1
Authorization: Bearer <token_admin_sistema>
```

**Como Usuario Normal:**
```bash
# Debe retornar SOLO activos de su empresa
GET /api/activos
Authorization: Bearer <token_usuario_normal>

# Debe retornar SOLO activos de su empresa (ignora empresaId del query)
GET /api/activos?empresaId=999
Authorization: Bearer <token_usuario_normal>
```

## 🐛 Solución de Problemas

### Problema: Usuario normal ve datos de otras empresas

**Causa**: El backend no está filtrando correctamente por `empresaId`

**Solución**: Verificar que:
1. El controlador usa `AdminSistemaUtil.getEmpresaIdFilter()`
2. El servicio recibe y aplica el `empresaId`
3. El usuario tiene `empresaId` en su token

### Problema: Admin del sistema no puede ver todas las empresas

**Causa**: El rol no está correctamente identificado

**Solución**: Verificar que:
1. El usuario tiene el rol `administrador_sistema` en la BD
2. El token JWT incluye el rol correcto
3. `AdminSistemaUtil.isAdminSistema()` retorna `true`

### Problema: Frontend muestra selector de empresa a usuarios normales

**Causa**: La verificación `isSystemAdmin()` no funciona

**Solución**: Verificar que:
1. El usuario tiene `role.nombre = 'administrador_sistema'` en localStorage
2. La función `isSystemAdmin()` está correctamente implementada

## 📝 Notas Importantes

1. **Seguridad**: El filtrado por empresa se hace en el **backend**, no en el frontend
2. **Token JWT**: El `empresaId` y `rol` se incluyen en el token JWT
3. **Query Params**: Los usuarios normales no pueden usar `empresaId` en query params para ver otras empresas
4. **Consistencia**: Todos los endpoints de listado usan el mismo patrón de filtrado

## 🔄 Flujo Completo

```
Usuario hace petición
    ↓
JwtAuthGuard valida token
    ↓
RolesGuard verifica permisos
    ↓
Controller recibe @CurrentUser()
    ↓
AdminSistemaUtil.getEmpresaIdFilter()
    ↓
Si es admin_sistema → undefined (sin filtro)
Si es usuario normal → user.empresaId
    ↓
Service aplica filtro
    ↓
Repository ejecuta query con WHERE empresaId = X
    ↓
Retorna datos filtrados
```

---

**Última actualización**: Implementación completa del sistema de permisos por empresa

