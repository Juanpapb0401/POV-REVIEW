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
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'alice123',
    roles: [UserRole.USER],
    isActive: true,
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'bob123',
    roles: [UserRole.USER],
    isActive: true,
  },
  {
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    password: 'carlos123',
    roles: [UserRole.USER],
    isActive: true,
  },
];
