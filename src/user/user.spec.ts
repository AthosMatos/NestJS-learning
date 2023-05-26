import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDataAvatar } from './user.validation';

describe('test UserController', () => {
  let usersController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                  data: {},
                };
              }
              return {
                code: 404,
              };
            }),
            getAvatarFromFS: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                  data: {},
                };
              }
              return {
                code: 500,
              };
            }),
            saveAvatarToFS: jest.fn().mockImplementation((id, avatarURL) => {
              if (id === '4' && avatarURL === 'mock') {
                return {
                  code: 200,
                };
              }
              return {
                code: 500,
              };
            }),
            checkifExistsInDB: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                };
              }
              return {
                code: 404,
              };
            }),
            checkifExistsInFS: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                };
              }
              return {
                code: 404,
              };
            }),
            saveAvatartoDB: jest
              .fn()
              .mockImplementation((doc: UserDataAvatar) => {
                if (doc.userId === '4') {
                  return {
                    code: 200,
                  };
                }
                return {
                  code: 500,
                };
              }),
            deleteAvatarFromFS: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                };
              }
              return {
                code: 500,
              };
            }),
            deleteAvatarFromDB: jest.fn().mockImplementation((id) => {
              if (id === '4') {
                return {
                  code: 200,
                };
              }
              return {
                code: 500,
              };
            }),
          },
        },
      ],
    }).compile();

    usersController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
  });
  describe('get user', () => {
    test('should get a user', async () => {
      const mockID = '4';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 200,
      } as unknown as Response;

      const result = await usersController.findbyId(mockID, mockResponse);

      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect(userService.findUserById).toHaveBeenCalled();
      expect(result.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    test('should not get a user', async () => {
      const mockID = '5';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 404,
      } as unknown as Response;

      const result = await usersController.findbyId(mockID, mockResponse);

      expect((await userService.findUserById(mockID)).code).toBe(404);
      expect(userService.findUserById).toHaveBeenCalled();
      expect(result.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(404);
    });
  });

  describe('get avatar', () => {
    test('should get an avatar and save in db', async () => {
      const mockID = '4';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 200,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInDB('3')).code).toBe(404);
      expect((await userService.saveAvatarToFS(mockID, 'mock')).code).toBe(200);
      expect((await userService.saveAvatartoDB({ userId: mockID })).code).toBe(
        200,
      );
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    test('should not get an avatar because user not found', async () => {
      const mockID = '5';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 404,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(404);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(404);
    });

    test('should get avatar but there is already a avatar saved in db', async () => {
      const mockID = '4';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 200,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.getAvatarFromFS(mockID)).code).toBe(200);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    test('error while getting avatar from fs', async () => {
      const mockID = '4';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 500,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.getAvatarFromFS('3')).code).toBe(500);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(500);
    });

    test('error while saving avatar to fs', async () => {
      const mockID = '4';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 500,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInDB('3')).code).toBe(404);
      expect((await userService.saveAvatarToFS('3', 'mock')).code).toBe(500);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(500);
    });

    test('error while saving avatar to db', async () => {
      const mockID = '4';

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 500,
      } as unknown as Response;

      const result = await usersController.getAvatar(mockID, mockResponse);
      expect((await userService.findUserById(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInDB('3')).code).toBe(404);
      expect((await userService.saveAvatarToFS(mockID, 'mock')).code).toBe(200);
      expect((await userService.saveAvatartoDB({ userId: '3' })).code).toBe(
        500,
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(500);
    });
  });

  describe('delete avatar', () => {
    test('should delete an avatar from db and fs', async () => {
      const mockID = '4';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 200,
      } as unknown as Response;
      const result = await usersController.deleteAvatar(mockID, mockResponse);

      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInFS(mockID)).code).toBe(200);
      expect((await userService.deleteAvatarFromFS(mockID)).code).toBe(200);
      expect((await userService.deleteAvatarFromDB(mockID)).code).toBe(200);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    test('should not delete an avatar because user not found in db', async () => {
      const mockID = '5';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 404,
      } as unknown as Response;
      const result = await usersController.deleteAvatar(mockID, mockResponse);

      expect((await userService.checkifExistsInDB(mockID)).code).toBe(404);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(404);
    });

    test('should not delete an avatar because user not found in fs', async () => {
      const mockID = '4';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 404,
      } as unknown as Response;
      const result = await usersController.deleteAvatar(mockID, mockResponse);

      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInFS('3')).code).toBe(404);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(404);
    });

    test('error while deleting avatar from db', async () => {
      const mockID = '4';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 500,
      } as unknown as Response;
      const result = await usersController.deleteAvatar(mockID, mockResponse);

      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInFS(mockID)).code).toBe(200);
      expect((await userService.deleteAvatarFromDB('3')).code).toBe(500);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(500);
    });

    test('error while deleting avatar from fs', async () => {
      const mockID = '4';

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        statusCode: 500,
      } as unknown as Response;
      const result = await usersController.deleteAvatar(mockID, mockResponse);

      expect((await userService.checkifExistsInDB(mockID)).code).toBe(200);
      expect((await userService.checkifExistsInFS(mockID)).code).toBe(200);
      expect((await userService.deleteAvatarFromDB(mockID)).code).toBe(200);
      expect((await userService.deleteAvatarFromFS('3')).code).toBe(500);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result.statusCode).toBe(500);
    });
  });
});
