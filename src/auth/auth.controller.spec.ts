import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      login: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on register', async () => {
    const dto = { email: 'a@a.com', password: 'pass', fullName: 'Test' } as any;
    service.create.mockResolvedValue({ id: 'u1', token: 'token' } as any);
    await expect(controller.create(dto)).resolves.toEqual({ id: 'u1', token: 'token' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.login on login', async () => {
    const dto = { email: 'a@a.com', password: 'pass' };
    service.login.mockResolvedValue({ id: 'u1', token: 'token' } as any);
    await expect(controller.login(dto)).resolves.toEqual({ id: 'u1', token: 'token' });
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('testPrivate should return ok message', () => {
    const result = controller.testPrivate();
    expect(result).toEqual({ ok: true, message: 'logged in' });
  });
});

