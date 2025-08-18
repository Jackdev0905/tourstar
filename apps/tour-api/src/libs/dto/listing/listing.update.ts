import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MyBooked } from '../../enums/listing.enum';
import { IsOptional } from 'class-validator';

@InputType()
export class ListingUpdate {
	@Field(() => String)
	memberId: ObjectId;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => MyBooked)
	myBooked: MyBooked;

	@IsOptional()
	@Field(()=> Number, {nullable:true})
	memberBookedCount:number
}
