// Système de permissions dynamique
export const PERMISSIONS = {
  // Gestion des cours
  COURSE_CREATE: 'course:create',
  COURSE_READ: 'course:read',
  COURSE_UPDATE: 'course:update',
  COURSE_DELETE: 'course:delete',
  COURSE_PUBLISH: 'course:publish',
  
  // Gestion des leçons
  LESSON_CREATE: 'lesson:create',
  LESSON_READ: 'lesson:read',
  LESSON_UPDATE: 'lesson:update',
  LESSON_DELETE: 'lesson:delete',
  
  // Gestion des utilisateurs
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Gestion des rôles
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ADMIN: 'dashboard:admin',
  
  // Inscriptions
  ENROLLMENT_CREATE: 'enrollment:create',
  ENROLLMENT_READ: 'enrollment:read',
  ENROLLMENT_DELETE: 'enrollment:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Rôles prédéfinis avec leurs permissions
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_DELETE,
    PERMISSIONS.COURSE_PUBLISH,
    PERMISSIONS.LESSON_CREATE,
    PERMISSIONS.LESSON_READ,
    PERMISSIONS.LESSON_UPDATE,
    PERMISSIONS.LESSON_DELETE,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ADMIN,
    PERMISSIONS.ENROLLMENT_CREATE,
    PERMISSIONS.ENROLLMENT_READ,
    PERMISSIONS.ENROLLMENT_DELETE,
  ],
  formateur: [
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_PUBLISH,
    PERMISSIONS.LESSON_CREATE,
    PERMISSIONS.LESSON_READ,
    PERMISSIONS.LESSON_UPDATE,
    PERMISSIONS.LESSON_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ENROLLMENT_READ,
  ],
  apprenant: [
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.LESSON_READ,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ENROLLMENT_CREATE,
  ],
  // Alias pour compatibilité
  instructor: [
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_PUBLISH,
    PERMISSIONS.LESSON_CREATE,
    PERMISSIONS.LESSON_READ,
    PERMISSIONS.LESSON_UPDATE,
    PERMISSIONS.LESSON_DELETE,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ENROLLMENT_READ,
  ],
  student: [
    PERMISSIONS.COURSE_READ,
    PERMISSIONS.LESSON_READ,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ENROLLMENT_CREATE,
  ],
} as const;

// Fonction pour vérifier si un utilisateur a une permission
export function hasPermission(userPermissions: string[], permission: Permission): boolean {
  return userPermissions.includes(permission);
}

// Fonction pour vérifier plusieurs permissions
export function hasAnyPermission(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.some(permission => userPermissions.includes(permission));
}

// Fonction pour vérifier toutes les permissions
export function hasAllPermissions(userPermissions: string[], permissions: Permission[]): boolean {
  return permissions.every(permission => userPermissions.includes(permission));
}

