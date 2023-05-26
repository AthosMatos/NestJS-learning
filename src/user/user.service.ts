import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDataAvatar } from './user.validation';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  access,
  constants,
} from 'fs';
import axios from 'axios';
import { UserServiceReturnI } from './user.interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('userAvatar')
    private readonly userAvatarModel: Model<UserDataAvatar>,
  ) {}

  async findUserById(id: string): Promise<UserServiceReturnI> {
    try {
      //request the user from the fake api
      const fakeUser = (await axios.get(`https://reqres.in/api/users/${id}`))
        .data.data;
      //convert the user to a json object -- in this case this is not necessary but it makes the code more readable
      const FakeUserJson = JSON.parse(JSON.stringify(fakeUser));
      return {
        message: 'User found successfully',
        code: 200,
        data: FakeUserJson,
      };
    } catch (error) {
      //deal with the error
      if (error.response.status == 404) {
        return {
          message: 'User not found',
          code: 404,
        };
      }
      return {
        message: 'Error while trying to get user from fake api ' + error,
        code: 500,
      };
    }
  }

  async getAvatarFromFS(userId: string): Promise<UserServiceReturnI> {
    try {
      // Read the image file from the fileSystem as a buffer
      const imageData = readFileSync('./src/saved_avatars/' + userId + '.jpg');

      // Convert the image buffer to base64
      const base64Data = imageData.toString('base64');

      // console.log('Avatar found successfully');
      return {
        code: 200,
        data: base64Data,
      };
    } catch (error) {
      console.error('Error reading image', error);
      return {
        code: 500,
        message: 'Error reading image: ' + error,
      };
    }
  }

  async saveAvatarToFS(
    userId: string,
    imageUrl: string,
  ): Promise<UserServiceReturnI> {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const fileName = userId + '.jpg';
      const folderName = './src/saved_avatars/';
      //load the image from the url and save it to the file system
      response.data.pipe(createWriteStream(folderName + fileName));
      const chunks = [];
      //check if the folder exists, if not create it
      if (!existsSync(folderName)) {
        mkdirSync(folderName);
      }
      const saveImageLocally = (response: any) =>
        new Promise(async (resolve, reject) => {
          response.data.on('data', (chunk: any) => chunks.push(chunk));

          response.data.on('end', (img: any) => {
            const result = Buffer.concat(chunks);
            resolve(result.toString('base64'));
          });
          response.data.on('error', (error: any) => reject(error));
        });
      //convert the image to base64
      const img64 = await saveImageLocally(response);

      //save the image to the database
      return {
        code: 200,
        data: img64,
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Error while trying to save image to file system ' + error,
      };
    }
  }

  async checkifExistsInDB(userId?: string): Promise<UserServiceReturnI> {
    //check if there is any avatar in the database
    let result;
    if (userId) result = await this.userAvatarModel.findOne({ userId: userId });
    else result = await this.userAvatarModel.findOne();
    //if the avatar does not exist return null
    if (!result)
      return {
        code: 404,
      };
    //if the avatar exists return the avatar
    else
      return {
        code: 200,
        data: result.userId,
      };
  }

  checkifExistsInFS = (userId: string) =>
    new Promise(
      async (
        resolve: (res: UserServiceReturnI) => void,
        reject: (res: UserServiceReturnI) => void,
      ) => {
        //check if there is any avatar in the file system
        try {
          access(
            './src/saved_avatars/' + userId + '.jpg',
            constants.F_OK,
            (err) => {
              if (err) {
                resolve({
                  message: 'Avatar not found',
                  code: 404,
                });
              } else {
                resolve({
                  message: 'Avatar found successfully',
                  code: 200,
                });
              }
            },
          );
        } catch (error) {
          reject({
            message:
              'Error while trying to get avatar from file system ' + error,
            code: 500,
          });
        }
      },
    );

  async saveAvatartoDB(doc: UserDataAvatar): Promise<UserServiceReturnI> {
    try {
      await new this.userAvatarModel(doc).save();
      return {
        code: 200,
      };
    } catch (error) {
      return {
        message: 'Error while trying to save avatar to database ' + error,
        code: 500,
      };
    }
  }

  async deleteAvatarFromFS(userId: string): Promise<UserServiceReturnI> {
    try {
      //delete the avatar from the file system
      unlinkSync('./src/saved_avatars/' + userId + '.jpg');
      return {
        message: 'Avatar deleted successfully',
        code: 200,
      };
    } catch (error) {
      return {
        message:
          'Error while trying to delete avatar from file system ' + error,
        code: 500,
      };
    }
  }

  async deleteAvatarFromDB(userId: string): Promise<UserServiceReturnI> {
    try {
      //delete the avatar from the database
      this.userAvatarModel.deleteOne({ userId: userId }).exec();
      return {
        message: 'Avatar deleted successfully',
        code: 200,
      };
    } catch (error) {
      return {
        message: 'Error while trying to delete avatar from database ' + error,
        code: 500,
      };
    }
  }
}
