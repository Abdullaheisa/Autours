/** Map API user_type / role values to frontend route guard roles. */
export function normalizeAuthRole(role: string | undefined | null): string {
  if (!role) return 'customer';
  const r = role.toLowerCase().trim();
  if (r === 'admin') return 'admin';
  if (r === 'active_supplier' || r === 'supplier' || r === 'under_review' || r === 'member') {
    return 'supplier';
  }
  return role;
}

export function isRoleAllowed(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  const normalized = normalizeAuthRole(userRole);
  return allowedRoles.some((allowed) => normalizeAuthRole(allowed) === normalized);
}

export function getPostLoginPath(role: string | undefined): string {
  const normalized = normalizeAuthRole(role);
  if (normalized === 'admin') return '/admin';
  if (normalized === 'supplier') return '/company';
  return '/';
}
