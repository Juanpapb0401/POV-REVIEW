import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  let service: jest.Mocked<SeedService>;

  beforeEach(async () => {
    const serviceMock = {
      runSeed: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [{ provide: SeedService, useValue: serviceMock }],
    }).compile();

    controller = module.get<SeedController>(SeedController);
    service = module.get(SeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.runSeed', async () => {
    const result = { ok: true, message: 'seeded' };
    service.runSeed.mockResolvedValue(result as any);
    await expect(controller.executeSeed()).resolves.toEqual(result);
    expect(service.runSeed).toHaveBeenCalled();
  });
});

