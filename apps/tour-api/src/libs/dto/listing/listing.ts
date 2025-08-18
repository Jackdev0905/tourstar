import { MyBooked } from './../../enums/listing.enum';
import { Field, ObjectType } from '@nestjs/graphql';
import { LikeGroup } from '../../enums/like.enum';
import { ObjectId } from 'mongoose';

@ObjectType()
export class MeListing {
	@Field(() => String)
	memberId: ObjectId;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => Boolean)
	myListing: boolean;
}

@ObjectType()
export class Listing {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => MyBooked)
	myBooked: MyBooked;

	@Field(() => String)
	propertyId: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}


