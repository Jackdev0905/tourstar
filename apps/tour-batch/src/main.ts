import { NestFactory } from '@nestjs/core';
import { TourBatchModule } from './tour-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(TourBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3001);
}
bootstrap();
