import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategies';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const userRepoMock: Partial<Record<keyof Repository<User>, jest.Mock>> = {
      findOneBy: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user when valid', async () => {
    const payload = { id: 'u1', email: 'a@a.com' };
    const user = { id: 'u1', isActive: true } as User;
    userRepo.findOneBy.mockResolvedValue(user);
    await expect(strategy.validate(payload)).resolves.toBe(user);
  });

  it('should throw when user not found', async () => {
    const payload = { id: 'missing', email: 'a@a.com' };
    userRepo.findOneBy.mockResolvedValue(null as any);
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw when user is inactive', async () => {
    const payload = { id: 'u1', email: 'a@a.com' };
    const user = { id: 'u1', isActive: false } as User;
    userRepo.findOneBy.mockResolvedValue(user);
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

