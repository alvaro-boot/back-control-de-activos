import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, Permission } from '../decorators/permissions.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Mapeo de roles a permisos
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  administrador: [
    // Activos - todos los permisos
    Permission.ACTIVOS_VIEW,
    Permission.ACTIVOS_CREATE,
    Permission.ACTIVOS_EDIT,
    Permission.ACTIVOS_DELETE,
    Permission.ACTIVOS_APPROVE,
    Permission.ACTIVOS_VIEW_FINANCIAL,
    Permission.ACTIVOS_QR_GENERATE,
    
    // Mantenimientos - todos los permisos
    Permission.MANTENIMIENTOS_VIEW,
    Permission.MANTENIMIENTOS_CREATE,
    Permission.MANTENIMIENTOS_EDIT,
    Permission.MANTENIMIENTOS_ASSIGN,
    Permission.MANTENIMIENTOS_APPROVE,
    
    // Asignaciones - todos los permisos
    Permission.ASIGNACIONES_VIEW,
    Permission.ASIGNACIONES_CREATE,
    Permission.ASIGNACIONES_EDIT,
    Permission.ASIGNACIONES_APPROVE,
    
    // Inventario - todos los permisos
    Permission.INVENTARIO_VIEW,
    Permission.INVENTARIO_MANAGE,
    
    // Reportes - todos los permisos
    Permission.REPORTES_VIEW,
    Permission.REPORTES_FINANCIAL,
    
    // Usuarios - gestión de su empresa
    Permission.USUARIOS_VIEW,
    Permission.USUARIOS_CREATE,
    Permission.USUARIOS_EDIT,
    Permission.USUARIOS_DELETE,
    
    // Aprobaciones
    Permission.APROBACIONES_VIEW,
    Permission.APROBACIONES_APPROVE,
  ],
  
  tecnico: [
    // Activos - solo lectura y QR
    Permission.ACTIVOS_VIEW,
    Permission.ACTIVOS_QR_GENERATE,
    
    // Mantenimientos - ejecutar y ver (solo los asignados)
    Permission.MANTENIMIENTOS_VIEW,
    Permission.MANTENIMIENTOS_EXECUTE,
    Permission.MANTENIMIENTOS_EDIT, // Para actualizar estado durante ejecución
    
    // Asignaciones - solo lectura
    Permission.ASIGNACIONES_VIEW,
    
    // Inventario - solo lectura
    Permission.INVENTARIO_VIEW,
  ],
  
  administrador_sistema: [
    // El super admin tiene todos los permisos
    ...Object.values(Permission),
  ],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.rol) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userRole = user.rol.nombre || user.rol;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `No tienes permisos suficientes. Requeridos: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}

