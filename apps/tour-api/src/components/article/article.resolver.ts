import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ArticleService } from './article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Article, Articles } from '../../libs/dto/article/article';
import {
	AllArticlesInquiry,
	ArticleInput,
	ArticlesInquiry,
} from '../../libs/dto/article/article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongooseObjectId } from '../../libs/config';
import { ArticleUpdate } from '../../libs/dto/article/article.update';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class ArticleResolver {
	constructor(private readonly articleService: ArticleService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Article)
	public async createArticle(
		@Args('input') input: ArticleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: createArticle');
		return await this.articleService.createArticle(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Article)
	public async getArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Article> {
		console.log('Query: getArticle');
		const articleId = shapeIntoMongooseObjectId(input);
		return await this.articleService.getArticle(memberId, articleId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Article)
	public async updateArticle(
		@Args('input') input: ArticleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Article> {
		console.log('Mutation: updateArticle');
		input._id = shapeIntoMongooseObjectId(input._id);
		return await this.articleService.updateArticle(memberId, input);
	}
	
	@UseGuards(AuthGuard)
	@Mutation(() => Article)
	public async likeTargetArticle(
		@AuthMember('_id') memberId: ObjectId,
		@Args('articleId') input: String,
	): Promise<Article> {
		console.log('Mutation: likeTargetArticle');
		const likeRefId = shapeIntoMongooseObjectId(input);
		return await this.articleService.likeTargetArticle(memberId, likeRefId);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Articles)
	public async getArticles(
		@Args('input') input: ArticlesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Articles> {
		console.log('Query: getArticles');
		return await this.articleService.getArticles(memberId, input);
	}

	// BY ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Articles)
	public async getAllArticlesByAdmin(@Args('input') input: AllArticlesInquiry): Promise<Articles> {
		console.log('Query: getAllArticlesByAdmin');
		return await this.articleService.getAllArticlesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Article)
	public async updateArticleByAdmin(@Args('input') input: ArticleUpdate): Promise<Article> {
		console.log('Mutation: updateArticleByAdmin');
		input._id = shapeIntoMongooseObjectId(input._id);
		return await this.articleService.updateArticleByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Article)
	public async removeArticleByAdmin(@Args('articleId') input: String): Promise<Article> {
		console.log('Mutation: removeArticleByAdmin');
		const articleId = shapeIntoMongooseObjectId(input);
		return await this.articleService.removeArticleByAdmin(articleId);
	}
}
