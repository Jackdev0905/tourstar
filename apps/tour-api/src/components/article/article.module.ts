import { Module } from '@nestjs/common';
import { ArticleResolver } from './article.resolver';
import { ArticleService } from './article.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import ArticleSchema from '../../schemas/Article.model';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule
	],

	providers: [ArticleResolver, ArticleService],
	exports:[ArticleService]
})
export class ArticleModule {}
