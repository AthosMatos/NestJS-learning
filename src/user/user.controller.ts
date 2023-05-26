import { Controller, Delete, Get, Param, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async findbyId(@Param('id') id: string, @Res() response: Response) {
    const user = await this.userService.findUserById(id);

    if (user.code == 200) return response.status(200).json(user.data);
    else return response.status(user.code).json(user.message);
  }

  @Get(':id/avatar')
  async getAvatar(@Param('id') id: string, @Res() response: Response) {
    //get the avatar url from the fake api
    const isAvatarinDB = await this.userService.findUserById(id);
    if (isAvatarinDB.code == 404) {
      return response.status(404).json({
        message: 'User not found',
      });
    }
    const avatarURL = isAvatarinDB.data.avatar;
    //check if a avatar already exists in the database
    const avatarUserId = await this.userService.checkifExistsInDB();
    if (avatarUserId.code == 200) {
      //if it exists get the avatar from the FileSystem database
      const avatar64 = await this.userService.getAvatarFromFS(
        avatarUserId.data,
      );
      if (avatar64.code != 200) {
        return response.status(500).json({
          message:
            'Error while getting avatar from file system: ' + avatar64.message,
        });
      }
      return response.status(200).json({
        message: 'Avatar already exists, returning previously saved avatar',
        avatar64: avatar64.data,
      });
    }

    //if it does not exist save it to the FileSystem database
    const savingToFSres = await this.userService.saveAvatarToFS(id, avatarURL);
    if (savingToFSres.code != 200) {
      return response.status(500).json({
        message:
          'Error while saving avatar to file system: ' + savingToFSres.message,
      });
    }
    const img64 = savingToFSres.data;
    //then save the avatar to the database
    const savetoDBResult = await this.userService.saveAvatartoDB({
      userId: id,
    });

    //if the avatar was not saved to the database return an error
    if (savetoDBResult.code != 200) {
      return response.status(500).json({
        message:
          'Error while saving avatar to database: ' + savetoDBResult.message,
      });
    }

    return response.status(200).json({
      message: 'Avatar saved successfully',
      avatar64: img64,
    });
  }

  @Delete(':id/avatar')
  async deleteAvatar(@Param('id') id: string, @Res() response: Response) {
    //check if a avatar already exists in the database
    const existsInDB = await this.userService.checkifExistsInDB(id);
    if (existsInDB.code == 404) {
      return response.status(404).json({
        message: 'Avatar not found in database',
      });
    }
    const userId = existsInDB.data;
    const existsInFS = await this.userService.checkifExistsInFS(userId);
    if (existsInFS.code == 404) {
      return response.status(404).json({
        message: 'Avatar not found in file system',
      });
    }

    //if it exists delete it from the FileSystem database
    const deleteResult = await this.userService.deleteAvatarFromDB(userId);
    //if the avatar was not deleted from the database return an error
    if (deleteResult.code != 200) {
      return response.status(500).json({
        message:
          'Error while deleting avatar from database: ' + deleteResult.message,
      });
    }

    const deleteResultFS = await this.userService.deleteAvatarFromFS(userId);
    //if the avatar was not deleted from the file system return an error
    if (deleteResultFS.code != 200) {
      return response.status(500).json({
        message:
          'Error while deleting avatar from file system: ' +
          deleteResultFS.message,
      });
    }

    return response.status(200).json({
      message: 'Avatar deleted successfully',
    });
  }

  @Get()
  Message(): string {
    return 'You can get a user by id by adding /api/user/{id} to the url, or get the avatar by adding /api/user/{id}/avatar to the url';
  }
}
