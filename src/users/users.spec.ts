import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { RabbitMQService } from '../rabbitMQ/rabbitMQ.service';
import { NodeMailerService } from '../nodeMailer/nodemailer.service';
import { UsersService } from './users.service';
import { Response } from 'express';
import { ValidUserData } from './users.validation';

describe('test UserController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [
        RabbitMQService,
        NodeMailerService,
        {
          provide: UsersService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation(async (userData: ValidUserData) => {
                if (
                  !userData.name ||
                  !userData.email ||
                  !userData.password ||
                  !userData.confirmPassword
                )
                  return { code: 500 };

                return {
                  code: 200,
                };
              }),
            findByMail: jest.fn().mockImplementation(async (email: string) => {
              if (email === 'mock') {
                return {
                  code: 200,
                };
              }
              return {
                code: 404,
              };
            }),
          },
        },
      ],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
  });
  describe('create', () => {
    test('should create a user', async () => {
      const mockUserData = {
        name: 'mock',
        email: 'mock',
        password: 'mock',
        confirmPassword: 'mock',
        // Provide the required properties for valid user data
      };

      const result = await usersController.create(mockUserData, {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: jest.fn().mockReturnValue(200),
      } as unknown as Response);

      expect((await usersService.create(mockUserData)).code).toBe(200);
      expect(result.statusCode).toBeDefined();
    });

    test('should not create a user', async () => {
      const mockUserData = {
        name: 'mock',
        email: 'mock',
        password: '',
        confirmPassword: '',
      };
      const result = await usersController.create(mockUserData, {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: jest.fn().mockReturnValue(500),
      } as unknown as Response);

      expect((await usersService.create(mockUserData)).code).toBe(500);
      expect(result.statusCode).toBeDefined();
    });

    test('should not find email', async () => {
      const mockmail = 'moc';

      const result = await usersService.findByMail(mockmail);

      expect(result.code).toBe(404);
    });

    test('should find email', async () => {
      const mockmail = 'mock';

      const result = await usersService.findByMail(mockmail);

      expect(result.code).toBe(200);
    });
  });
});
