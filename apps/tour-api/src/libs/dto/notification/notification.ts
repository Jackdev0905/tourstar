import { ObjectType, Field, ID } from '@nestjs/graphql';
import { NotificationType, NotificationStatus, NotificationGroup } from '../../enums/notification.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Notification {
	@Field(() => ID)
	_id: string;

	@Field(() => NotificationType)
	notificationType: NotificationType;

	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@Field()
	notificationTitle: string;

	@Field({ nullable: true })
	notificationDesc?: string;

	@Field(() => ID)
	authorId: string;

	@Field(() => ID)
	receiverId: string;

	@Field(() => ID, { nullable: true })
	propertyId?: string;

	@Field(() => ID, { nullable: true })
	articleId?: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

    @Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Notifications {
    @Field(() => [Notification])
    list: Notification[];

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[];
}