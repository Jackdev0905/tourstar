import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import {
	NotificationInput,
	NotificationsInquiry,
	UpdateNotificationStatusInput,
} from '../../libs/dto/notification/notification.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { shapeIntoMongooseObjectId } from '../../libs/config';

@Resolver(() => Notification)
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getUserNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		console.log('Query: getUserNotifications');
		input.search.receiverId = shapeIntoMongooseObjectId(input.search.receiverId);
		return this.notificationService.getUserNotifications(input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async createNotification(
		@Args('input') input: NotificationInput,
		@AuthMember('_id') authorId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: createNotification');
		input.authorId = shapeIntoMongooseObjectId(authorId);
		input.receiverId = shapeIntoMongooseObjectId(input.receiverId);
		if (input.propertyId) input.propertyId = shapeIntoMongooseObjectId(input.propertyId);
		if (input.articleId) input.articleId = shapeIntoMongooseObjectId(input.articleId);
		return this.notificationService.createNotification(input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async markNotificationAsRead(
		@Args('input') input: UpdateNotificationStatusInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: markNotificationAsRead');
		const notificationId = shapeIntoMongooseObjectId(input.notificationId);
		return this.notificationService.markAsRead(notificationId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async deleteAllNotifications(@AuthMember('_id') memberId: ObjectId): Promise<boolean> {
		console.log('Mutation: deleteAllNotifications');

		return this.notificationService.deleteAllNotifications(memberId);
	}
}
