import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { NotificationGroup, NotificationType } from '../../enums/notification.enum';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { availableCommentSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsNotEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsNotEmpty()
	@Field()
	notificationTitle: string;

    @IsOptional()
	@Field({ nullable: true })
	notificationDesc?: string;

	@IsNotEmpty()
	@Field(() => String)
	authorId: string;

	@IsNotEmpty()
	@Field(() => String)
	receiverId: string;
    
    @IsOptional()
	@Field(() => String, { nullable: true })
	propertyId?: string;
    
    @IsOptional()
	@Field(() => ID, { nullable: true })
	articleId?: string;
}

@InputType()
export class UpdateNotificationStatusInput {
	@Field(() => ID)
	notificationId: string;
}

@InputType()
class NISearch {
	@IsNotEmpty()
	@Field(() => String)
	receiverId: ObjectId;

	@IsOptional()
	@Field(() => NotificationGroup, { nullable: true })
	notificationGroup?: NotificationGroup;
}

@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableCommentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => NISearch)
	search: NISearch;
}
