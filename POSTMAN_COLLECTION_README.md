# 📮 Colección de Postman - Sistema de Control de Activos

Esta carpeta contiene la colección completa de Postman para probar todos los endpoints de la API del Sistema de Control de Activos.

## 📁 Archivos Incluidos

1. **Control-de-Activos-API.postman_collection.json** - Colección completa con todos los endpoints
2. **Control-de-Activos-Environment.postman_environment.json** - Variables de entorno preconfiguradas
3. **generate-postman-collection.js** - Script para regenerar la colección
4. **generate-postman-env.js** - Script para regenerar el archivo de entorno

## 🚀 Instalación y Uso

### Paso 1: Importar en Postman

1. Abre Postman
2. Haz clic en **Import** (botón superior izquierdo)
3. Arrastra y suelta o selecciona los siguientes archivos:
   - `Control-de-Activos-API.postman_collection.json`
   - `Control-de-Activos-Environment.postman_environment.json`

### Paso 2: Configurar el Entorno

1. En Postman, selecciona el entorno **"Control de Activos - Entorno"** en el selector de entornos (esquina superior derecha)
2. Verifica que las variables estén configuradas:
   - `base_url`: `http://localhost:3000` (ajusta si tu servidor está en otro puerto)
   - `token`: Se llenará automáticamente después del login
   - Otras variables: Ajusta según tus necesidades

### Paso 3: Iniciar Sesión

1. Ve a la carpeta **"Autenticación"**
2. Ejecuta la petición **"Login"**
3. El token se guardará automáticamente en la variable `token` gracias al script de test incluido
4. Ahora puedes usar todas las demás peticiones que requieren autenticación

## 📚 Estructura de la Colección

La colección está organizada en las siguientes carpetas:

### 🔐 Autenticación
- **Login**: Inicia sesión y obtiene tokens
- **Registrar Usuario**: Crea un nuevo usuario
- **Refrescar Token**: Renueva el token de acceso

### 👥 Usuarios
- Listar, obtener, crear, actualizar y eliminar usuarios
- Solo administradores pueden crear/actualizar/eliminar

### 🏢 Empresas
- Gestión completa de empresas
- Solo administradores

### 💼 Activos
- CRUD completo de activos
- **Regenerar QR**: Regenera el código QR de un activo
- Los activos generan QR automáticamente al crearse

### 📱 QR
- **Ver Activo desde QR**: Endpoint público para ver información del activo (no requiere autenticación)

### 📦 Asignaciones
- Asignar activos a empleados
- Devolver activos
- Ver historial de asignaciones por activo o empleado

### 🔧 Mantenimientos
- Crear y gestionar mantenimientos
- Ver historial de mantenimientos por activo
- Filtrar por activo o técnico

### 📅 Mantenimientos Programados
- Programar mantenimientos futuros
- Ver mantenimientos próximos (próximos 7 días por defecto)

### 👨‍💼 Empleados
- Gestión completa de empleados
- Filtrar por empresa

### 🏛️ Áreas
- Gestión de áreas organizacionales
- Filtrar por sede

### 🏢 Sedes
- Gestión de sedes de la empresa
- Filtrar por empresa

### 📂 Categorías
- Gestión de categorías de activos
- Filtrar por empresa

### 🏪 Proveedores
- Gestión de proveedores
- Filtrar por empresa

### 🛡️ Garantías
- Gestionar garantías de activos
- Ver garantías por activo

### 📜 Historial de Activos
- Ver historial completo de cambios de activos
- Crear registros de historial

### 💰 Depreciación de Activos
- Calcular y gestionar depreciación de activos
- Filtrar por activo

### 🔗 Activos-Proveedores
- Gestionar relaciones entre activos y proveedores
- Filtrar por activo o proveedor

## 🔑 Roles y Permisos

### Administrador
- Acceso completo a todos los endpoints
- Puede crear, actualizar y eliminar cualquier recurso

### Técnico
- Puede gestionar activos, asignaciones y mantenimientos
- Puede crear y actualizar garantías
- No puede eliminar recursos (excepto en algunos casos)

### Empleado
- Solo lectura de sus activos asignados
- Acceso limitado a consultas

## 💡 Características Especiales

### Auto-guardado de Token
El endpoint de **Login** incluye un script que automáticamente guarda el `accessToken` y `refreshToken` en las variables de entorno después de un login exitoso.

### Variables Dinámicas
Muchos endpoints usan variables como `{{activoId}}`, `{{empleadoId}}`, etc. Puedes actualizar estos valores en el entorno de Postman para reutilizar las peticiones fácilmente.

### Filtros por Query Parameters
Muchos endpoints de listado aceptan parámetros de consulta para filtrar resultados:
- `?empresaId=1` - Filtrar por empresa
- `?activoId=1` - Filtrar por activo
- `?empleadoId=1` - Filtrar por empleado
- `?tecnicoId=1` - Filtrar por técnico
- `?sedeId=1` - Filtrar por sede

## 🔄 Regenerar la Colección

Si necesitas regenerar los archivos después de cambios en la API:

```bash
cd back-end
node generate-postman-collection.js
node generate-postman-env.js
```

## 📝 Notas Importantes

1. **Base URL**: Por defecto está configurada en `http://localhost:3000`. Si tu servidor corre en otro puerto o dominio, actualiza la variable `base_url` en el entorno.

2. **Token de Autenticación**: Después del login, el token se guarda automáticamente. Si expira, usa el endpoint "Refrescar Token" o vuelve a hacer login.

3. **Multitenant**: El sistema es multitenant. Los usuarios no administradores solo ven recursos de su empresa automáticamente.

4. **Validaciones**: La API valida todos los datos. Revisa los mensajes de error para entender qué campos son requeridos o inválidos.

5. **Códigos QR**: Los códigos QR se generan automáticamente al crear un activo. El endpoint `/api/qr/activo/:id` es público y no requiere autenticación.

## 🐛 Solución de Problemas

### Error 401 (Unauthorized)
- Verifica que hayas hecho login
- Comprueba que el token no haya expirado
- Revisa que el token esté en el header `Authorization: Bearer {{token}}`

### Error 403 (Forbidden)
- Verifica que tu usuario tenga el rol necesario para la operación
- Algunos endpoints solo están disponibles para administradores

### Error 404 (Not Found)
- Verifica que el ID del recurso exista
- Comprueba que estés usando el ID correcto

### Error 400 (Bad Request)
- Revisa que todos los campos requeridos estén presentes
- Verifica que los tipos de datos sean correctos
- Consulta la documentación del endpoint para ver los campos requeridos

## 📞 Soporte

Para más información sobre la API, consulta:
- `API_DOCUMENTATION.md` - Documentación completa de la API
- `RESUMEN_PROYECTO.md` - Resumen del proyecto
- Swagger UI: `http://localhost:3000/api` (cuando el servidor esté corriendo)

