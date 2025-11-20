# 📦 Guía de Instalación y Configuración

## Requisitos Previos

- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Archivo YAML

Copia el archivo `config.yaml.example` a `config.yaml` y configura los valores:

```bash
cp config.yaml.example config.yaml
```

Edita el archivo `config.yaml` con tus credenciales:

```yaml
# Configuración del servidor
server:
  port: 3000
  nodeEnv: development

# Configuración de la base de datos MySQL
database:
  host: localhost
  port: 3306
  username: root
  password: "tu_password"
  database: control_activos

# Configuración de JWT
jwt:
  secret: "tu-secret-key-super-segura-aqui"
  expiresIn: "1h"
  refreshSecret: "tu-refresh-secret-key-super-segura-aqui"
  refreshExpiresIn: "7d"

# Configuración de QR
qr:
  baseUrl: "http://localhost:3000/qr/activo"
```

**Importante:** El archivo `config.yaml` está en `.gitignore` para no subir secrets al repositorio.

### 3. Crear Base de Datos

Ejecuta el script SQL de inicialización:

```bash
mysql -u root -p < database/init.sql
```

O manualmente:

```sql
CREATE DATABASE control_activos;
USE control_activos;
-- Luego ejecuta el contenido de database/init.sql
```

### 4. Ejecutar la Aplicación

#### Modo Desarrollo

```bash
npm run start:dev
```

#### Modo Producción

```bash
npm run build
npm run start:prod
```

### 5. Acceder a la Documentación

Una vez iniciado el servidor:

- **Swagger UI**: http://localhost:3000/api
- **API Base**: http://localhost:3000/api

## Estructura de Carpetas

```
back-end/
├── src/
│   ├── main.ts                 # Punto de entrada
│   ├── app.module.ts           # Módulo principal
│   ├── config/                 # Configuraciones
│   ├── common/                 # Utilidades compartidas
│   │   ├── guards/             # Guards de autenticación
│   │   ├── decorators/         # Decoradores personalizados
│   │   ├── exceptions/         # Manejo de excepciones
│   │   ├── interceptors/       # Interceptores
│   │   └── utils/              # Utilidades
│   └── modules/                # Módulos de la aplicación
│       ├── auth/               # Autenticación
│       ├── usuarios/           # Usuarios
│       ├── empresas/           # Empresas
│       ├── areas/              # Áreas
│       ├── empleados/          # Empleados
│       ├── activos/            # Activos
│       ├── asignaciones/       # Asignaciones
│       └── mantenimientos/     # Mantenimientos
├── database/
│   └── init.sql                # Script de inicialización
└── uploads/
    └── qr/                     # Imágenes QR generadas
```

## Primeros Pasos

### 1. Crear una Empresa

```bash
POST /api/empresas
{
  "nombre": "Mi Empresa S.A.",
  "nit": "123456789-1",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "correo": "contacto@empresa.com"
}
```

### 2. Registrar un Usuario Administrador

```bash
POST /api/auth/register
{
  "empresaId": 1,
  "roleId": 1,  // 1=administrador, 2=tecnico, 3=empleado
  "nombre": "Admin",
  "correo": "admin@empresa.com",
  "password": "password123"
}
```

### 3. Iniciar Sesión

```bash
POST /api/auth/login
{
  "correo": "admin@empresa.com",
  "password": "password123"
}
```

Respuesta:
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

### 4. Usar el Token

En las siguientes peticiones, incluye el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Roles y Permisos

- **administrador**: Acceso completo al sistema
- **tecnico**: Puede gestionar activos, asignaciones y mantenimientos
- **empleado**: Solo puede consultar sus activos asignados

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh` - Refrescar token

### Activos
- `GET /api/activos` - Listar activos
- `POST /api/activos` - Crear activo (genera QR automáticamente)
- `GET /api/activos/:id` - Ver activo
- `PATCH /api/activos/:id` - Actualizar activo
- `POST /api/activos/:id/regenerar-qr` - Regenerar QR
- `GET /api/qr/activo/:id` - Ver activo desde QR (público)

### Asignaciones
- `POST /api/asignaciones` - Asignar activo a empleado
- `GET /api/asignaciones` - Listar asignaciones
- `PATCH /api/asignaciones/:id/devolver` - Devolver activo
- `GET /api/asignaciones/historial/activo/:id` - Historial del activo
- `GET /api/asignaciones/historial/empleado/:id` - Historial del empleado

### Mantenimientos
- `POST /api/mantenimientos` - Crear mantenimiento
- `GET /api/mantenimientos` - Listar mantenimientos
- `GET /api/mantenimientos/proximos` - Mantenimientos próximos
- `GET /api/mantenimientos/historial/activo/:id` - Historial del activo

## Tareas Programadas (Cron Jobs)

El sistema incluye un cron job que se ejecuta diariamente a las 9:00 AM para revisar los mantenimientos programados en los próximos 7 días.

## Notas Importantes

1. **Sincronización de Base de Datos**: En desarrollo, TypeORM sincroniza automáticamente. En producción, usa migraciones.

2. **Imágenes QR**: Se guardan en `uploads/qr/` y se sirven en `/uploads/qr/`.

3. **Seguridad**: 
   - Cambia los secretos JWT en producción
   - Usa HTTPS en producción
   - Configura CORS apropiadamente

4. **Multitenant**: El sistema filtra automáticamente por empresa según el usuario autenticado (excepto administradores).

## Solución de Problemas

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo
- Revisa las credenciales en `.env`
- Asegúrate de que la base de datos exista

### Error al generar QR
- Verifica que la carpeta `uploads/qr/` tenga permisos de escritura
- Revisa que `QR_BASE_URL` esté correctamente configurado

### Error de autenticación
- Verifica que el token JWT sea válido
- Revisa que el usuario esté activo
- Confirma que el secret JWT sea correcto

