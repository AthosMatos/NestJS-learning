import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: Channel;
  private connection: Connection;

  async onModuleInit() {
    try {
      console.log('Connecting to RabbitMQ');
      this.connection = await connect('amqp://localhost:5672'); //Local RabbitMQ server, change if needed
      console.log('Connected to RabbitMQ');

      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue('test-queue');
    } catch (error) {
      console.log(error);
    }
  }

  async publishMessage(message: string): Promise<void> {
    try {
      this.channel.sendToQueue('test-queue', Buffer.from(message));
      console.log('Message sent to the queue successfully');
    } catch (error) {
      console.log('Error publishing message:', error);
    }
  }
}
