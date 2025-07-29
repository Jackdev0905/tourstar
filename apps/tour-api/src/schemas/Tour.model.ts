import { Schema } from 'mongoose';
import {
	TourDurationType,
	TourIncludedOption,
	TourLanguage,
	TourLocation,
	TourStatus,
	TourType,
} from '../libs/enums/tour.enum';

const TourSchema = new Schema(
	{
		tourType: {
			type: String,
			enum: TourType,
			required: true,
		},

		tourStatus: {
			type: String,
			enum: TourStatus,
			default: TourStatus.ACTIVE,
		},

		tourLocation: {
			type: String,
			enum: TourLocation,
			required: true,
		},

		tourAddress: {
			type: String,
			required: true,
		},

		tourTitle: {
			type: String,
			required: true,
		},

		tourPrice: {
			type: Number,
			required: true,
		},

		tourDate: {
			type: Date,
			required: true,
		},

		tourDurationType: {
			type: TourDurationType,
			required: true,
		},

		tourLanguage: {
			type: String,
			enum: TourLanguage,
		},
		tourMaxParticipants: {
			type: Number,
			required: true,
			min: 1,
		},

		tourBookedCount: {
			type: Number,
			default: 0,
			min: 0,
		},

		tourIncluded: {
			type: [String],
			enum: [TourIncludedOption], // yana o'ylash kerak
			default: [],
		},

		tourViews: {
			type: Number,
			default: 0,
		},

		tourLikes: {
			type: Number,
			default: 0,
		},

		tourComments: {
			type: Number,
			default: 0,
		},

		tourRank: {
			type: Number,
			default: 0,
		},

		tourImages: {
			type: [String],
			required: true,
		},

		tourDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'tours' },
);

TourSchema.index({ tourType: 1, tourLocation: 1, tourDate: 1, tourPrice: 1 }, { unique: true });

export default TourSchema;
