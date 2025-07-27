import { Test, TestingModule } from '@nestjs/testing';
import { TourBatchController } from './tour-batch.controller';
import { TourBatchService } from './tour-batch.service';

describe('TourBatchController', () => {
  let tourBatchController: TourBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TourBatchController],
      providers: [TourBatchService],
    }).compile();

    tourBatchController = app.get<TourBatchController>(TourBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(tourBatchController.getHello()).toBe('Hello World!');
    });
  });
});
