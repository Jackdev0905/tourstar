import { Module } from '@nestjs/common';
import { TourBatchController } from './tour-batch.controller';
import { TourBatchService } from './tour-batch.service';
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TourBatchController],
  providers: [TourBatchService],
})
export class TourBatchModule {}
