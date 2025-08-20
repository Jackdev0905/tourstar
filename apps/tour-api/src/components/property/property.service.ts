import { LikeService } from '../like/like.service';
import { PropertyStatus, PropertyActivities } from './../../libs/enums/property.enum';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	OrdinaryInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, lookupMyListing, shapeIntoMongooseObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { MyBooked } from '../../libs/enums/listing.enum';
import { ListingInput } from '../../libs/dto/listing/listing.input';
import { ListingService } from '../listing/listing.service';
import { Listing } from '../../libs/dto/listing/listing';
import { ListingUpdate } from '../../libs/dto/listing/listing.update';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
		private listingService: ListingService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.propertyModel.create(input);
			if (!input.memberId) {
				throw new BadRequestException('Member ID is required');
			}
			await this.memberService.memberStatsEditor({ _id: input?.memberId, targetKey: 'memberProperties', modifier: 1 });
			if (!result) throw new BadRequestException(Message.CREATE_FAILED);
			return result;
		} catch (err) {
			console.log('Error, createProperty service', err?.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const search: T = {
			_id: propertyId,
			propertyStatus: PropertyStatus.ACTIVE,
		};
		const targetProperty = await this.propertyModel.findOne(search).exec();

		if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput: ViewInput = {
				memberId: memberId,
				viewRefId: propertyId,
				viewGroup: ViewGroup.PROPERTY,
			};
			const newView = await this.viewService.viewRecord(viewInput);
			if (newView) {
				await this.propertStatsModifier({
					_id: propertyId,
					targetKey: 'propertyViews',
					modifier: 1,
				});
				targetProperty.propertyViews++;
			}

			const likeInput: LikeInput = {
				memberId: memberId,
				likeGroup: LikeGroup.PROPERTY,
				likeRefId: propertyId,
			};
			targetProperty.meLiked = await this.likeService.checkLikeExistance(likeInput);
			//@ts-ignore
			const listingInput: ListingInput = {
				memberId: memberId,
				propertyId: propertyId,
			};
			targetProperty.meListing = await this.listingService.checkListingExistance(listingInput);
		}
		targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);

		return targetProperty;
	}

	public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;

		const search: T = {
			_id: input._id,
			memberId: memberId,
			propertyStatus: PropertyStatus.ACTIVE,
		};
		console.log('search', search);

		if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
		if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();

		const result = await this.propertyModel
			.findByIdAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property> {
		const target: Property | null = await this.propertyModel
			.findOne({ _id: likeRefId, propertyStatus: PropertyStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PROPERTY,
		};

		const modifier = await this.likeService.likeToggle(input);
		const result = await this.propertStatsModifier({
			_id: likeRefId,
			targetKey: 'propertyLikes',
			modifier: modifier,
		});
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async listingProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const target: Property | null = await this.propertyModel
			.findOne({ _id: propertyId, propertyStatus: PropertyStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: ListingInput = {
			memberId: memberId,
			propertyId: propertyId,
			myBooked: MyBooked.PAUSED,
		};

		await this.listingService.listingToggle(input);

		const updatedProperty = await this.propertyModel.findById(propertyId).exec();

		if (!updatedProperty) {
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}

		return updatedProperty;
	}

	public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = { propertyStatus: PropertyStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		this.shapeMatchQuery(match, input);
		console.log('match:', match);
		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupAuthMemberLiked(memberId),
							lookupMyListing(memberId),
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

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const {
			memberId,
			locationList,
			activityList,
			langList,
			typeList,
			audienceList,
			pricesRange,
			includedOptions,
			memberCount,
			text,
			propertyDate,
		} = input.search;

		if (memberId) match.memberId = shapeIntoMongooseObjectId(memberId);
		if (propertyDate) {
			const start = new Date(propertyDate);
			start.setHours(0, 0, 0, 0);
			const end = new Date(propertyDate);
			end.setHours(23, 59, 59, 999);

			match.propertyDate = { $gte: start, $lte: end };
		}

		if (locationList) match.propertyLocation = { $in: locationList };
		if (activityList) match.propertyActivities = { $in: activityList };
		if (includedOptions) match.propertyIncluded = { $in: includedOptions };
		if (langList) match.propertyLanguage = { $in: langList };
		if (typeList) match.propertyType = { $in: typeList };
		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (audienceList) match.propertyTargetAudience = { $in: audienceList };
		if (memberCount) {
			match.$expr = {
				$gte: [{ $subtract: ['$propertyMaxParticipants', '$propertyBookedCount'] }, memberCount],
			};
		}

		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties | null> {
		return await this.likeService.getFavoriteProperties(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties | null> {
		return await this.viewService.getVisitedProperties(memberId, input);
	}

	public async getMyListings(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties | null> {
		return await this.listingService.getListingProperties(memberId, input);
	}

	public async updateMyListing(memberId: ObjectId, input: ListingUpdate): Promise<Property> {
		const targetProperty = await this.propertyModel.findOne({ _id: input.propertyId }).exec();
		if (
			targetProperty &&
			input.memberBookedCount > targetProperty.propertyMaxParticipants - targetProperty.propertyBookedCount
		) {
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}
		await this.listingService.updateListingProperty(input);
		const result = await this.propertStatsModifier({
			_id: input.propertyId,
			targetKey: 'propertyBookedCount',
			modifier: input.memberBookedCount,
		});
		if (targetProperty && targetProperty.propertyMaxParticipants === targetProperty.propertyBookedCount) {
			await this.updateProperty(memberId, {
				soldAt: new Date(),
				_id: targetProperty._id,
				propertyStatus: PropertyStatus.SOLD,
			});
		}
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { memberId: memberId, propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		const result = await this.propertyModel
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

	public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, propertyLocationList } = input.search;

		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList };

		const result = await this.propertyModel
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

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;

		const search: T = {
			_id: input._id,
			propertyStatus: PropertyStatus.ACTIVE,
		};
		console.log('search', search);

		if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();

		const result = await this.propertyModel
			.findByIdAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		const result = await this.propertyModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	public async propertStatsModifier(input: StatisticModifier): Promise<Property | null> {
		const { _id, modifier, targetKey } = input;

		return await this.propertyModel
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
