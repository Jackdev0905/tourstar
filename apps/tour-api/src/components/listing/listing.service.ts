import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { Properties, Property } from '../../libs/dto/property/property';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite, lookupListing } from '../../libs/config';
import { Listing, MeListing } from '../../libs/dto/listing/listing';
import { ListingInput } from '../../libs/dto/listing/listing.input';
import { ListingUpdate } from '../../libs/dto/listing/listing.update';
import { MyBooked } from '../../libs/enums/listing.enum';

@Injectable()
export class ListingService {
	constructor(@InjectModel('Listing') private readonly listingModel: Model<Listing>) {}

	public async listingToggle(input: ListingInput): Promise<number> {
		let modifier = 1;
		const search: T = {
			memberId: input.memberId,
			propertyId: input.propertyId,
		};
		const exist = await this.listingModel.findOne(search).exec();
		if (exist) {
			await this.listingModel.findOneAndDelete(input).exec();
			modifier = -1;
		} else {
			try {
				await this.listingModel.create(input);
			} catch (err) {
				console.log('Error, likeToggle model', err?.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		return modifier;
	}

	public async checkListingExistance(input: ListingInput): Promise<MeListing[]> {
		const { memberId, propertyId } = input;
		const result = await this.listingModel.findOne({ memberId: memberId, propertyId: propertyId }).exec();

		return result ? [{ memberId: memberId, propertyId: propertyId, myListing: true }] : [];
	}

	public async updateListingProperty(input: ListingUpdate): Promise<Listing> {
		const { propertyId, memberId, myBooked } = input;

		const result = await this.listingModel
			.findOneAndUpdate({ memberId, propertyId, myBooked: MyBooked.PAUSED }, { myBooked }, { new: true })
			.exec();

		if (!result) {
			throw new BadRequestException(Message.SOMETHING_WENT_WRONG);
		}

		return result;
	}

	public async getListingProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties | null> {
		const { page, limit, myBooked } = input;
		const match: T = { memberId: memberId, myBooked: myBooked };
		const data = await this.listingModel.aggregate([
			{ $match: match },
			{ $sort: { createdAt: -1 } },

			{
				$lookup: {
					from: 'properties',
					localField: 'propertyId',
					foreignField: '_id',
					as: 'listingProperty',
				},
			},
			{
				$unwind: '$listingProperty',
			},
			{
				$facet: {
					list: [
						{ $skip: (page - 1) * limit },
						{ $limit: limit },
						lookupListing,
						{
							$unwind: '$listingProperty.memberData',
						},
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);
		console.log(data);
		const result: Properties = {
			list: data[0].list.map((ele) => ele.listingProperty),
			metaCounter: data[0].metaCounter,
		};

		return result;
	}
}
