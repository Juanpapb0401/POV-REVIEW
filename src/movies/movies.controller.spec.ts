import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: jest.Mocked<MoviesService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto = { title: 'Test' } as any;
    service.create.mockResolvedValue({ id: '1' } as any);
    await expect(controller.create(dto)).resolves.toEqual({ id: '1' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll', async () => {
    service.findAll.mockResolvedValue([]);
    await expect(controller.findAll()).resolves.toEqual([]);
  });

  it('should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' } as any);
    await expect(controller.findOne('1')).resolves.toEqual({ id: '1' });
  });

  it('should call service.update', async () => {
    const dto = { title: 'Updated' } as any;
    service.update.mockResolvedValue({ id: '1', title: 'Updated' } as any);
    await expect(controller.update('1', dto)).resolves.toEqual({ id: '1', title: 'Updated' });
  });

  it('should call service.remove', async () => {
    service.remove.mockResolvedValue({ message: 'deleted', id: '1' });
    await expect(controller.remove('1')).resolves.toEqual({ message: 'deleted', id: '1' });
  });
});

