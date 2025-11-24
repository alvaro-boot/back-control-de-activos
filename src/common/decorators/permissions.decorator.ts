import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export enum Permission {
  // Activos
  ACTIVOS_VIEW = 'activos:view',
  ACTIVOS_CREATE = 'activos:create',
  ACTIVOS_EDIT = 'activos:edit',
  ACTIVOS_DELETE = 'activos:delete',
  ACTIVOS_APPROVE = 'activos:approve',
  ACTIVOS_VIEW_FINANCIAL = 'activos:view_financial',
  ACTIVOS_QR_GENERATE = 'activos:qr_generate',
  
  // Mantenimientos
  MANTENIMIENTOS_VIEW = 'mantenimientos:view',
  MANTENIMIENTOS_CREATE = 'mantenimientos:create',
  MANTENIMIENTOS_EDIT = 'mantenimientos:edit',
  MANTENIMIENTOS_ASSIGN = 'mantenimientos:assign',
  MANTENIMIENTOS_APPROVE = 'mantenimientos:approve',
  MANTENIMIENTOS_EXECUTE = 'mantenimientos:execute',
  
  // Asignaciones
  ASIGNACIONES_VIEW = 'asignaciones:view',
  ASIGNACIONES_CREATE = 'asignaciones:create',
  ASIGNACIONES_EDIT = 'asignaciones:edit',
  ASIGNACIONES_APPROVE = 'asignaciones:approve',
  
  // Inventario
  INVENTARIO_VIEW = 'inventario:view',
  INVENTARIO_MANAGE = 'inventario:manage',
  INVENTARIO_PHYSICAL = 'inventario:physical',
  
  // Reportes
  REPORTES_VIEW = 'reportes:view',
  REPORTES_FINANCIAL = 'reportes:financial',
  
  // Usuarios
  USUARIOS_VIEW = 'usuarios:view',
  USUARIOS_CREATE = 'usuarios:create',
  USUARIOS_EDIT = 'usuarios:edit',
  USUARIOS_DELETE = 'usuarios:delete',
  
  // Aprobaciones
  APROBACIONES_VIEW = 'aprobaciones:view',
  APROBACIONES_APPROVE = 'aprobaciones:approve',
}

export const Permissions = (...permissions: Permission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

