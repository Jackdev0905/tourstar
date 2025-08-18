import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { AuthModule } from './auth/auth.module';
import { FollowModule } from './follow/follow.module';
import { ArticleModule } from './article/article.module';
import { ListingModule } from './listing/listing.module';
import { NotificationModule } from './notification/notification.module';
import { NoticeModule } from './notice/notice.module';

@Module({
  imports: [MemberModule, PropertyModule, CommentModule, LikeModule, ViewModule, AuthModule, FollowModule, ArticleModule, ListingModule, NotificationModule, NoticeModule]
})
export class ComponentsModule {}
