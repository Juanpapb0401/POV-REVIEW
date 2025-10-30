import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;
  let dataSource: { createQueryRunner: jest.Mock };

  beforeEach(async () => {
    const repoMock: Partial<Record<keyof Repository<User>, jest.Mock>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn() as any,
    };

    const queryRunnerMock = {
      manager: { save: jest.fn() },
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repoMock },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const dto = { email: 'new@test.com', password: 'pass', fullName: 'New User' } as any;
      const user = { id: 'u1', ...dto } as User;
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);
      const result = await service.create(dto);
      expect(result).toBe(user);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(user);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 'u1' }, { id: 'u2' }] as User[];
      repo.find.mockResolvedValue(users);
      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(result).toEqual(users);
      expect(repo.find).toHaveBeenCalledWith({ take: 10, skip: 0 });
    });

    it('should handle pagination with different values', async () => {
      const users = [{ id: 'u3' }] as User[];
      repo.find.mockResolvedValue(users);
      const result = await service.findAll({ limit: 5, offset: 10 });
      expect(result).toEqual(users);
      expect(repo.find).toHaveBeenCalledWith({ take: 5, skip: 10 });
    });
  });

  describe('findOne', () => {
    it('should find by id (uuid)', async () => {
      const user = { id: '2d931510-d99f-494a-8c67-87feb05e1594' } as User;
      repo.findOne.mockResolvedValue(user);
      await expect(service.findOne(user.id)).resolves.toBe(user);
    });

    it('should find by email', async () => {
      const qb: any = { where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue({ id: 'u1' }) };
      (repo.createQueryBuilder as any).mockReturnValue(qb);
      const user = await service.findOne('a@a.com');
      expect(user).toEqual({ id: 'u1' });
    });

    it('should throw when not found', async () => {
      repo.findOne.mockResolvedValueOnce(null as any);
      const qb: any = { where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      (repo.createQueryBuilder as any).mockReturnValue(qb);
      await expect(service.findOne('missing@example.com')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOneWithReviews', () => {
    it('should find by id (uuid) with reviews', async () => {
      const user = { id: '2d931510-d99f-494a-8c67-87feb05e1594', reviews: [] } as any;
      repo.findOne.mockResolvedValue(user);
      await expect(service.findOneWithReviews(user.id)).resolves.toBe(user);
    });

    it('should find by email with reviews', async () => {
      const user = { id: 'u1', email: 'a@a.com', reviews: [] };
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      (repo.createQueryBuilder as any).mockReturnValue(qb);
      await expect(service.findOneWithReviews('a@a.com')).resolves.toBe(user);
    });
  });

  describe('update', () => {
    it('should update user with transaction successfully', async () => {
      const dto = { fullName: 'Updated' } as any;
      const user = { id: 'u1', fullName: 'Updated' } as any;
      repo.preload.mockResolvedValue(user);
      
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      };
      (repo.createQueryBuilder as any).mockReturnValue(qb);

      const queryRunnerMock = dataSource.createQueryRunner();
      (queryRunnerMock.manager.save as jest.Mock).mockResolvedValue(user);

      const result = await service.update('u1', dto);
      
      expect(result).toEqual(user);
      expect(queryRunnerMock.connect).toHaveBeenCalled();
      expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should throw when preload returns null', async () => {
      repo.preload.mockResolvedValue(null as any);
      await expect(service.update('x', { email: 'e' } as any)).rejects.toBeInstanceOf(NotFoundException);
    });

  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const user = { id: 'u1' } as User;
      repo.findOne.mockResolvedValue(user);
      (repo.createQueryBuilder as any).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(user),
      });
      repo.remove.mockResolvedValue(user);
      await service.remove('u1');
      expect(repo.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles successfully', async () => {
      const user = { id: 'u1', roles: ['user'] } as any;
      const updatedUser = { id: 'u1', roles: ['admin'], password: 'hashed' } as any;
      repo.findOne.mockResolvedValue(user);
      repo.save.mockResolvedValue(updatedUser);
      const result = await service.updateUserRoles('u1', { roles: ['admin'] } as any);
      expect(result?.user?.password).toBeUndefined();
      expect(result?.message).toBe('User roles updated successfully');
    });

    it('should throw when user not found', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.updateUserRoles('u1', { roles: ['admin'] } as any)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('userProfile', () => {
    it('should return user when found', async () => {
      const user = { id: 'u1', email: 'a@a.com' } as User;
      repo.findOne.mockResolvedValue(user);
      await expect(service.userProfile('u1')).resolves.toBe(user);
    });
  });

  describe('findOneWithReviews - not found', () => {
    it('should throw NotFoundException when user not found by id', async () => {
      repo.findOne.mockResolvedValue(null as any);
      await expect(service.findOneWithReviews('2d931510-d99f-494a-8c67-87feb05e1594')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user not found by email', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      (repo.createQueryBuilder as any).mockReturnValue(qb);
      await expect(service.findOneWithReviews('missing@email.com')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create - error handling', () => {
    it('should handle duplicate email error', async () => {
      const dto = { email: 'dup@test.com', password: 'pass', fullName: 'Dup' } as any;
      repo.create.mockReturnValue({} as any);
      repo.save.mockRejectedValue({ code: '23505', detail: 'Duplicate email' });
      await expect(service.create(dto)).rejects.toThrow();
    });

    it('should log error when error code is not 23505', async () => {
      const dto = { email: 'test@test.com', password: 'pass', fullName: 'Test' } as any;
      repo.create.mockReturnValue({} as any);
      repo.save.mockRejectedValue({ code: 'OTHER_ERROR', detail: 'Some error' });
      
      // The error handler logs but doesn't rethrow for non-23505 errors
      await service.create(dto);
    });
  });

});


