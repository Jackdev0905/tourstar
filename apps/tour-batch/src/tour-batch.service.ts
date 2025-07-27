import { Injectable } from '@nestjs/common';

@Injectable()
export class TourBatchService {
  getHello(): string {
    return 'Hello World! From batch server';
  }
}
