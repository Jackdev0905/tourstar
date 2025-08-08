import { LikeService } from '../like/like.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import {
	AllArticlesInquiry,
	ArticleInput,
	ArticlesInquiry,
} from '../../libs/dto/article/article.input';
import { Article, Articles } from '../../libs/dto/article/article';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ArticleStatus } from '../../libs/enums/article.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ArticleUpdate } from '../../libs/dto/article/article.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongooseObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class ArticleService {
	constructor(
		@InjectModel('Article') private readonly articleModel: Model<Article>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createArticle(memberId: ObjectId, input: ArticleInput): Promise<Article> {
		input.memberId = memberId;
		try {
			const result = await this.articleModel.create(input);
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: 1,
			});
			return result;
		} catch (err) {
			console.log('Error, service createArticle', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async getArticle(memberId: ObjectId, articleId: ObjectId): Promise<Article> {
		const search: T = {
			_id: articleId,
			articleStatus: ArticleStatus.ACTIVE,
		};

		const result = await this.articleModel.findOne(search).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		console.log('result', result);

		if (memberId) {
			const input: ViewInput = {
				memberId: memberId,
				viewRefId: articleId,
				viewGroup: ViewGroup.ARTICLE,
			};

			const newView = await this.viewService.viewRecord(input);

			if (newView) {
				await this.articleStatsModifier({
					_id: articleId,
					targetKey: 'articleViews',
					modifier: 1,
				});
				result.articleViews++;
			}
			const likeInput: LikeInput = {
				memberId: memberId,
				likeGroup: LikeGroup.ARTICLE,
				likeRefId: articleId,
			};
			result.meLiked = await this.likeService.checkLikeExistance(likeInput);
		}

		result.memberData = await this.memberService.getMember(null, result.memberId);
		return result;
	}

	public async updateArticle(memberId: ObjectId, input: ArticleUpdate): Promise<Article> {
		const { _id, articleStatus } = input;

		const result = await this.articleModel
			.findOneAndUpdate({ _id: _id, memberId: memberId, articleStatus: ArticleStatus.ACTIVE }, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === ArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}
		return result;
	}

	public async likeTargetArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<Article> {
		const target: Article | null = await this.articleModel
			.findOne({ _id: likeRefId, articleStatus: ArticleStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier = await this.likeService.likeToggle(input);
		const result = await this.articleStatsModifier({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getArticles(memberId: ObjectId, input: ArticlesInquiry): Promise<Articles> {
		const { articleCategory, text } = input.search;
		const match: T = { articleStatus: ArticleStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input.search?.memberId) {
			match.memberId = shapeIntoMongooseObjectId(input.search.memberId);
		}

		console.log('match:', match);
		const result = await this.articleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
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

	public async getAllArticlesByAdmin(input: AllArticlesInquiry): Promise<Articles> {
		const { articleCategory, articleStatus } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (articleCategory) match.articleCategory = articleCategory;
		if (articleStatus) match.articleStatus = articleStatus;

		console.log('match:', match);
		const result = await this.articleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
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

	public async updateArticleByAdmin(input: ArticleUpdate): Promise<Article> {
		let { articleStatus, _id } = input;

		const search: T = {
			_id: _id,
			articleStatus: ArticleStatus.ACTIVE,
		};

		const result = await this.articleModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === ArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeArticleByAdmin(articleId: ObjectId): Promise<Article> {
		const search: T = { _id: articleId, articleStatus: ArticleStatus.DELETE };
		const result = await this.articleModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	public async articleStatsModifier(input: StatisticModifier): Promise<Article | null> {
		const { _id, modifier, targetKey } = input;

		return await this.articleModel
			.findByIdAndUpdate(
				_id,
				{
					$inc: {
						[targetKey]: modifier,
					},
				},
				{ new: true },
			)
			.exec();
	}
}
