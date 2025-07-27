import { Controller, Get } from '@nestjs/common';
import { TourBatchService } from './tour-batch.service';

@Controller()
export class TourBatchController {
  constructor(private readonly tourBatchService: TourBatchService) {}

  @Get()
  getHello(): string {
    return this.tourBatchService.getHello();
  }
}
