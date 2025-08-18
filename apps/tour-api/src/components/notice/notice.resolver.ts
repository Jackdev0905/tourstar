import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { shapeIntoMongooseObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async createNotice(@Args('input') input: NoticeInput, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation: createNotice');
		return await this.noticeService.createNotice(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async updateNotice(
		@Args('input') input: NoticeUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notice> {
		console.log('Mutation: updateNotice');
		input._id = shapeIntoMongooseObjectId(input._id);
		return await this.noticeService.updateNotice(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Notice)
	public async getNotice(@Args('noticeId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Notice> {
		console.log('Mutation: getNotice');
		const noticeId = shapeIntoMongooseObjectId(input);
		return await this.noticeService.getNotice(memberId, noticeId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Notices)
	public async getNotices(
		@Args('input') input: NoticesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notices> {
		console.log('Query: getNotices');
		if (input.search?.noticeCategory) {
			input.search.noticeCategory = input.search.noticeCategory;
		}
		return await this.noticeService.getNotices(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Notice)
	public async removeNoticeByAdmin(@Args('noticeId') input: String): Promise<Notice> {
		console.log('Mutation: removeNoticeByAdmin');
		const noticeId = shapeIntoMongooseObjectId(input);
		return await this.noticeService.removeNoticeByAdmin(noticeId);
	}
}
