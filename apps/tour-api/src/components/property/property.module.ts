import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PropertyResolver } from './property.resolver';
import { PropertyService } from './property.service';
import { ViewModule } from '../view/view.module';
import { AuthModule } from '../auth/auth.module';
import PropertySchema from '../../schemas/Property.model';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import { ListingModule } from '../listing/listing.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]), AuthModule, ViewModule, MemberModule, LikeModule, ListingModule],
  providers: [PropertyResolver, PropertyService],
  exports:[PropertyService]
})
export class PropertyModule {}
 