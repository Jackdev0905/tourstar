import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { AuthModule } from './auth/auth.module';
import { FollowModule } from './follow/follow.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [MemberModule, PropertyModule, CommentModule, LikeModule, ViewModule, AuthModule, FollowModule, ArticleModule]
})
export class ComponentsModule {}
