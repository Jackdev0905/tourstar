import { Properties } from './../../tour-api/src/libs/dto/property/property';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/tour-api/src/libs/dto/member/member';
import { Property } from 'apps/tour-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/tour-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/tour-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	@InjectModel('Member') private readonly memberModel: Model<Member>;
	@InjectModel('Property') private readonly propertyModel: Model<Property>;

	public async batchRollback(): Promise<void> {
		await this.propertyModel
			.updateMany(
				{
					propertyStatus: PropertyStatus.ACTIVE,
				},
				{
					propertyRank: 0,
				},
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{
					memberRank: 0,
				},
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		const properties: Property[] = await this.propertyModel
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();
		const promisedList = properties.map(async (ele) => {
			const { _id, propertyLikes, propertyViews } = ele;
			const rank = propertyLikes * 2 + propertyViews;
			return await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank }).exec();
		});
		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberStatus: MemberStatus.ACTIVE,
				memberType: MemberType.AGENT,
				memberRank: 0,
			})
			.exec();
		const promisedList = agents.map(async (ele) => {
			const { _id, memberProperties, memberArticles, memberLikes, memberViews } = ele;
			const rank = memberProperties * 5 + memberArticles * 3 + memberLikes * 2 + memberViews;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank }).exec();
		});
		await Promise.all(promisedList);
	}

	public getHello(): string {
    console.log("Hello batch");
    
		return 'Hello  BATCH Server!';

	}
}
