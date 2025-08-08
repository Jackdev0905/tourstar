import { NestFactory } from '@nestjs/core';
import { PropertyBatchModule } from './property-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(PropertyBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3001);
}
bootstrap();
