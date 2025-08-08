import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, Length, IsOptional, Min, IsInt } from 'class-validator';
import {
	PropertyActivities,
	PropertyIncludedOption,
	PropertyLanguage,
	PropertyLocation,
	PropertyStatus,
	PropertyTargetAudience,
	PropertyType,
} from '../../enums/property.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class PropertyUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => PropertyType, { nullable: true })
	propertyType?: PropertyType;

	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;

	@IsOptional()
	@Field(() => PropertyLocation, { nullable: true })
	propertyLocation?: PropertyLocation;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	propertyPrice?: number;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	propertyDate?: Date;

	@IsOptional()
	@Field(() => String, { nullable: true })
	propertyDuration?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	propertyMaxParticipants?: number;

	@IsOptional()
	@Field(() => [PropertyIncludedOption], { nullable: true })
	propertyIncluded?: PropertyIncludedOption[];

	@IsOptional()
	@Field(() => [PropertyTargetAudience], { nullable: true })
	propertyTargetAudience?: PropertyTargetAudience[];

	@IsOptional()
	@Field(() => [PropertyActivities], { nullable: true })
	propertyActivities?: PropertyActivities[];

	@IsOptional()
	@Field(() => [PropertyLanguage], { nullable: true })
	propertyLanguage?: PropertyLanguage[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	propertyImages?: string[];

	@IsOptional()
	@Length(5, 100)
	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	soldAt?: Date;

	deletedAt?: Date;
}
