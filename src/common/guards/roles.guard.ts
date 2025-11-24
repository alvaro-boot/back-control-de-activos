import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Obtener el rol del usuario (puede venir de diferentes formas)
    const userRole = user.rol?.nombre || user.role?.nombre || user.role;
    
    // El administrador del sistema tiene acceso a todo
    if (userRole === 'administrador_sistema') {
      return true;
    }
    
    return requiredRoles.some((role) => userRole === role);
  }
}

