import { UserRole } from "src/auth/enums/roles.enum";


export const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // cambiar por hash en produccion
    roles: [UserRole.ADMIN],
    isActive: true,
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    roles: [UserRole.USER],
    isActive: true,
  },
];
