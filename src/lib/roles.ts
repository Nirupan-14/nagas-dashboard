export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export const VALID_ROLES: UserRole[] = ['admin', 'manager', 'staff', 'viewer'];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users:create', 'users:read', 'users:update', 'users:delete',
    'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete',
    'payments:create', 'payments:read', 'payments:update', 'payments:delete',
    'activities:create', 'activities:read', 'activities:update', 'activities:delete',
    'settings:read', 'settings:update',
  ],
  manager: [
    'bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete',
    'payments:create', 'payments:read', 'payments:update',
    'activities:create', 'activities:read', 'activities:update', 'activities:delete',
    'settings:read',
  ],
  staff: [
    'bookings:read', 'bookings:update',
    'payments:read',
    'activities:read', 'activities:update',
  ],
  viewer: [
    'bookings:read',
    'payments:read',
    'activities:read',
  ],
};

export const PERMISSION_GROUPS: { group: string; label: string; permissions: string[] }[] = [
  {
    group: 'users',
    label: 'Users',
    permissions: ['users:create', 'users:read', 'users:update', 'users:delete'],
  },
  {
    group: 'bookings',
    label: 'Bookings',
    permissions: ['bookings:create', 'bookings:read', 'bookings:update', 'bookings:delete'],
  },
  {
    group: 'payments',
    label: 'Payments',
    permissions: ['payments:create', 'payments:read', 'payments:update', 'payments:delete'],
  },
  {
    group: 'activities',
    label: 'Activities',
    permissions: ['activities:create', 'activities:read', 'activities:update', 'activities:delete'],
  },
  {
    group: 'settings',
    label: 'Settings',
    permissions: ['settings:read', 'settings:update'],
  },
];