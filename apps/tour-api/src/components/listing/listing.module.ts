import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { MongooseModule } from '@nestjs/mongoose';
import ListingSchema from '../../schemas/Listing.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Listing', schema: ListingSchema }])],

	providers: [ListingService],
	exports: [ListingService],
})
export class ListingModule {}
