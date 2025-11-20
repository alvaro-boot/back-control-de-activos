# 🏢 Sistema de Control de Activos con QR Dinámico

Backend desarrollado en NestJS con arquitectura modular, limpia y escalable.

## 🚀 Características

- ✅ Autenticación JWT con refresh tokens
- ✅ Control de roles (admin, técnico, empleado)
- ✅ Multi-empresa (multitenant)
- ✅ Generación de QR dinámico para activos
- ✅ Gestión completa de activos, asignaciones y mantenimientos
- ✅ Documentación con Swagger
- ✅ Validación y transformación de datos
- ✅ Manejo global de excepciones
- ✅ Logs y middlewares

## 📋 Requisitos Previos

- Node.js >= 18
- MySQL >= 8.0
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar archivo YAML:
```bash
cp config.yaml.example config.yaml
```

3. Editar `config.yaml` con tus credenciales de base de datos y configuración.

4. Crear la base de datos:
```sql
CREATE DATABASE control_activos;
```

5. Ejecutar migraciones (si las hay) o sincronizar con TypeORM.

## 🏃 Ejecutar

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez iniciado el servidor, accede a:
- Swagger UI: http://localhost:3000/api

## 🗄️ Estructura del Proyecto

```
src/
├── main.ts
├── app.module.ts
├── config/
├── common/
├── modules/
└── infrastructure/
```

## 🔐 Roles

- **administrador**: Acceso completo al sistema
- **tecnico**: Gestión de mantenimientos
- **empleado**: Consulta de activos asignados

