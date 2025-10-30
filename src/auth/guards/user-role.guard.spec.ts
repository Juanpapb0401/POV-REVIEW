import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleGuard } from './user-role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const reflectorMock = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get<UserRoleGuard>(UserRoleGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when no roles are required', () => {
    reflector.get.mockReturnValue(undefined);
    const context = createMockContext({ id: 'u1', roles: ['user'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when roles array is empty', () => {
    reflector.get.mockReturnValue([]);
    const context = createMockContext({ id: 'u1', roles: ['user'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when user has valid role', () => {
    reflector.get.mockReturnValue(['admin']);
    const context = createMockContext({ id: 'u1', roles: ['admin'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw BadRequestException when user not found', () => {
    reflector.get.mockReturnValue(['admin']);
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    reflector.get.mockReturnValue(['admin']);
    const context = createMockContext({ id: 'u1', email: 'a@a.com', roles: ['user'] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
  } as any;
}

