/**
 * Utilidad para verificar si un usuario es administrador del sistema
 * El administrador del sistema puede ver y gestionar todas las empresas
 */
export class AdminSistemaUtil {
  /**
   * Verifica si un usuario es administrador del sistema
   * @param user Usuario del request
   * @returns true si es administrador del sistema
   */
  static isAdminSistema(user: any): boolean {
    if (!user || !user.rol) {
      return false;
    }
    
    // El administrador del sistema tiene el rol con nombre "administrador_sistema"
    return user.rol.nombre === 'administrador_sistema';
  }

  /**
   * Obtiene el empresaId para filtrar, retorna undefined si es admin del sistema
   * @param user Usuario del request
   * @param empresaIdQuery empresaId del query param (opcional)
   * @returns empresaId para filtrar o undefined si debe ver todo
   */
  static getEmpresaIdFilter(user: any, empresaIdQuery?: string | number): number | undefined {
    // Si es administrador del sistema, puede ver todo (undefined = sin filtro)
    if (this.isAdminSistema(user)) {
      // Si especifica un empresaId en el query, lo respeta
      return empresaIdQuery ? Number(empresaIdQuery) : undefined;
    }
    
    // Si hay empresaId en el query, lo usa
    if (empresaIdQuery) {
      return Number(empresaIdQuery);
    }
    
    // Por defecto, usa la empresa del usuario
    return user?.empresaId;
  }
}

