import { UserRole } from '../../users/entities/user.entity';

export const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // cambiar por hash en produccion
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: UserRole.USER,
    isActive: true,
  },
];
