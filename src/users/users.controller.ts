import {
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { ValidUserData } from './users.validation';
import { UsersService } from './users.service';
import { RabbitMQService } from '../rabbitMQ/rabbitMQ.service';
import { NodeMailerService } from '../nodeMailer/nodemailer.service';
import { Response } from 'express';

@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private rabbitM: RabbitMQService,
    private Mailer: NodeMailerService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) userData: ValidUserData,
    @Res() response: Response,
  ) {
    try {
      // Check if the user already exists
      const userExists = await this.usersService.findByMail(userData.email);

      if (userExists.code == 200) {
        this.rabbitM.publishMessage(
          `User already exists with email ${userData.email}`,
        );
        return response.status(409).json({
          message: 'User already exists',
        });
      }

      const user = await this.usersService.create(userData); // Try to create the user
      if (user.code == 500) {
        this.rabbitM.publishMessage(
          `Error while trying to create user: ${user.message}`,
        );
        return response.status(500).json({
          message: 'Error while trying to create user: ' + user.message,
        });
      }
      this.Mailer.sendEmail(
        'mock@mail.com',
        'mock2@mail.com',
        'User creatition',
        'User created successfully',
      );
      this.rabbitM.publishMessage(
        `User created successfully with email ${userData.email}`,
      );
      // If the user was created successfully return the user
      return response.status(201).json({
        message: 'User created successfully',
        data: user.data,
      });
    } catch (error) {
      // If there was an error while trying to create the user return the error
      return response.status(500).json({
        message: 'Error while trying to create user: ' + error,
      });
    }
  }
  @Get()
  Message(@Res() response: Response) {
    console.log('Trying the get method in the users controller');

    return response.status(200).json({
      message:
        'Use the post method to create a new user, if you want to get a user use the /api/user/{id} route',
    });
  }
}
