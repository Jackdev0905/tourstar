import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Document } from 'mongoose';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { lookupMember, lookupNotification } from '../../libs/config';

export type NotificationDocument = Notification & Document;

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification')
		private readonly notificationModel: Model<NotificationDocument>,
	) {}

	/**
	 * Create a new notification
	 */
	async createNotification(input: NotificationInput): Promise<Notification> {
		const newNotification = new this.notificationModel(input);
		return await newNotification.save();
	}

	/**
	 * Get all notifications for a specific user
	 */
	async getUserNotifications(input: NotificationsInquiry): Promise<Notifications> {
		const { receiverId } = input.search;
		const match: T = { receiverId: receiverId };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupNotification,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	/**
	 * Mark a notification as read
	 */
	async markAsRead(notificationId: string): Promise<Notification> {
		const notification = await this.notificationModel.findById(notificationId);
		if (!notification) throw new NotFoundException('Notification not found');

		notification.notificationStatus = NotificationStatus.READ;
		return await notification.save();
	}

	/**
	 * Delete a notification
	 */
	async deleteAllNotifications(memberId: ObjectId): Promise<boolean> {
		const result = await this.notificationModel.deleteMany({ receiverId: memberId });
		return result.deletedCount > 0;
	}
}
