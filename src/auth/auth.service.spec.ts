import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const userRepoMock: Partial<Record<keyof Repository<User>, jest.Mock>> = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should register a new user with encrypted password and return token', async () => {
      const dto = { email: 'test@test.com', password: 'pass123', fullName: 'Test User' };
      const hashedPassword = 'hashed-pass';
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      const createdUser = { id: 'u1', email: dto.email, fullName: dto.fullName, password: hashedPassword, roles: ['user'] };
      userRepo.create.mockReturnValue(createdUser as any);
      userRepo.save.mockResolvedValue(createdUser as any);

      const result = await service.create(dto);

      expect(userRepo.create).toHaveBeenCalledWith({
        email: dto.email,
        fullName: dto.fullName,
        password: hashedPassword,
        roles: ['user'],
      });
      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('email', dto.email);
      expect(result.password).toBeUndefined();
    });

    it('should throw InternalServerErrorException on duplicate email (23505)', async () => {
      const dto = { email: 'dup@test.com', password: 'pass', fullName: 'Dup' };
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed');
      userRepo.create.mockReturnValue({} as any);
      userRepo.save.mockRejectedValue({ code: '23505', detail: 'Duplicate email' });

      await expect(service.create(dto)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const dto = { email: 'user@test.com', password: 'pass' };
      const user = { id: 'u1', email: dto.email, password: 'hashed-pass' };
      userRepo.findOne.mockResolvedValue(user as any);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.login(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
        select: { email: true, password: true, id: true },
      });
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null as any);
      await expect(service.login({ email: 'missing@test.com', password: 'pass' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when password is invalid', async () => {
      const user = { id: 'u1', email: 'user@test.com', password: 'hashed' };
      userRepo.findOne.mockResolvedValue(user as any);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.login({ email: user.email, password: 'wrong' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('encryptPassword', () => {
    it('should hash password with bcrypt', () => {
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed');
      const result = service.encryptPassword('plain');
      expect(bcrypt.hashSync).toHaveBeenCalledWith('plain', 10);
      expect(result).toBe('hashed');
    });
  });

  describe('login - additional cases', () => {
    it('should login with correct password (branch coverage)', async () => {
      const dto = { email: 'user2@test.com', password: 'correctpass' };
      const user = { id: 'u2', email: dto.email, password: 'hashedpass' };
      userRepo.findOne.mockResolvedValue(user as any);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);

      const result = await service.login(dto);
      expect(result).toHaveProperty('token');
      expect(result.password).toBeUndefined();
    });
  });
});

