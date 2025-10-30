import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = { id: 'u1', email: 'a@a.com', roles: ['admin'] } as any;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneWithReviews: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      updateUserRoles: jest.fn(),
      userProfile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findAll', async () => {
    service.findAll.mockResolvedValue([]);
    await expect(controller.findAll({ limit: 10, offset: 0 })).resolves.toEqual([]);
  });

  it('should call service.findOneWithReviews via findOne', async () => {
    service.findOneWithReviews.mockResolvedValue({ id: 'u1', reviews: [] } as any);
    const result = await controller.findOne('u1');
    expect(result).toEqual({ id: 'u1', reviews: [] });
    expect(service.findOneWithReviews).toHaveBeenCalledWith('u1');
  });


  it('should call service.update', async () => {
    const dto = { fullName: 'Updated' } as any;
    service.update.mockResolvedValue({ id: 'u1', fullName: 'Updated' } as any);
    await expect(controller.update('u1', dto)).resolves.toEqual({ id: 'u1', fullName: 'Updated' });
  });

  it('should call service.remove', async () => {
    service.remove.mockResolvedValue(undefined);
    await expect(controller.remove('u1')).resolves.toBeUndefined();
  });

  it('should call service.updateUserRoles', async () => {
    const dto = { roles: ['admin'] } as any;
    service.updateUserRoles.mockResolvedValue({ message: 'updated', user: mockUser } as any);
    await expect(controller.updateUserRoles('u1', dto)).resolves.toEqual({ message: 'updated', user: mockUser });
  });

  it('should call service.userProfile', async () => {
    service.userProfile.mockResolvedValue(mockUser);
    const result = await controller.userProfile(mockUser);
    expect(result).toBe(mockUser);
    expect(service.userProfile).toHaveBeenCalledWith(mockUser.id);
  });
});

