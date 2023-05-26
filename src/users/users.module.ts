import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersSchema } from './users.model'; // Import the user model
import { UsersService } from './users.service';
import { RabbitMQService } from '../rabbitMQ/rabbitMQ.service';
import { NodeMailerService } from '../nodeMailer/nodemailer.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UsersSchema }])], // Add the user model schema
  controllers: [UsersController],
  providers: [UsersService, RabbitMQService, NodeMailerService],
})
export class UsersModule {}
