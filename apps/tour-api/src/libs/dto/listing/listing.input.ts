import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { MyBooked } from '../../enums/listing.enum';

@InputType()
export class ListingInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	propertyId: ObjectId;

	@IsOptional()
	@Field(() => MyBooked)
	myBooked: MyBooked;
}
