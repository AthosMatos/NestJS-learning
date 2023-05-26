import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  Notification(): string {
    return 'Try adding /api/users to the URL.';
  }
}
