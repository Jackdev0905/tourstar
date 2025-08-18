import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';
import { NoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { lookupMember, shapeIntoMongooseObjectId } from '../../libs/config';

@Injectable()
export class NoticeService {
	constructor(@InjectModel('Notice') private readonly noticeModel: Model<Notice>) {}

	public async createNotice(memberId: ObjectId, input: NoticeInput): Promise<Notice> {
		input.memberId = memberId;
		let result: Notice | null = null;

		try {
			result = await this.noticeModel.create(input);
		} catch (err) {
			console.log('Error, service createNotice', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	public async getNotice(memberId: ObjectId, noticeId: ObjectId): Promise<Notice> {
		const result = await this.noticeModel
			.findOne({
				_id: noticeId,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result;
	}

	public async updateNotice(memberId: ObjectId, input: NoticeUpdate): Promise<Notice> {
		const { _id } = input;

		const result = await this.noticeModel
			.findOneAndUpdate({ _id: _id, memberId: memberId }, input, { new: true })
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getNotices(memberId: ObjectId, input: NoticesInquiry): Promise<Notices> {
		const { text, noticeCategory, noticeStatus } = input.search;
		const match: T = {};

		if (noticeCategory) {
			match.noticeCategory = noticeCategory;
		}

		if (noticeStatus) {
			match.noticeStatus = noticeStatus;
		}
		if (text) {
			match.noticeTitle = { $regex: new RegExp(text, 'i') };
		}

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.noticeModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async removeNoticeByAdmin(input: ObjectId): Promise<Notice> {
		const result = await this.noticeModel.findByIdAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
