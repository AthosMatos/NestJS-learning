import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidUserData } from './users.validation';
import { UsersServiceReturnI } from './users.interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<ValidUserData>,
  ) {}

  async create(doc: ValidUserData): Promise<UsersServiceReturnI> {
    try {
      const result = await new this.userModel(doc).save();
      return {
        code: 200,
        message: 'User created successfully',
        data: result,
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Error while trying to create user: ' + error,
      };
    }
  }

  async findByMail(email: string): Promise<UsersServiceReturnI> {
    try {
      const result = await this.userModel.find({ email: email });

      if (result.length == 0)
        return {
          code: 404,
        };
      else
        return {
          code: 200,
        };
    } catch (error) {
      return {
        code: 500,
        message: 'Error while trying to find user by email: ' + error,
      };
    }
  }
}
