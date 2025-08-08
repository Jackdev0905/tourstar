import { PropertyActivities, PropertyTargetAudience } from './../libs/enums/property.enum';
import { Schema } from 'mongoose';
import {
	PropertyIncludedOption,
	PropertyLanguage,
	PropertyLocation,
	PropertyStatus,
	PropertyType,
} from '../libs/enums/property.enum';

const PropertySchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: PropertyType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: PropertyStatus,
			default: PropertyStatus.ACTIVE,
		},

		propertyLocation: {
			type: String,
			enum: PropertyLocation,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertyDate: {
			type: Date,
			required: true,
		},

		propertyDuration: {
			type:String,
			required: true,
		},

		propertyLanguage: {
			type: [String],
			enum: PropertyLanguage,
			default: []
		},

		propertyIncluded: {
			type: [String],
			enum: PropertyIncludedOption, // yana o'ylash kerak
			default: []
		},

		propertyTargetAudience: {
			type: [String],
			enum: PropertyTargetAudience, // yana o'ylash kerak
			default: []
		},

		propertyActivities: {
			type: [String],
			enum: PropertyActivities, // yana o'ylash kerak
			default: []
		},

		propertyMaxParticipants: {
			type: Number,
			required: true,
			min: 1,
		},

		propertyBookedCount: {
			type: Number,
			default: 0,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
			maxlength: 5000,
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
	{ timestamps: true, collection: 'properties' },
);

PropertySchema.index({ propertyType: 1, propertyLocation: 1, propertyDate: 1, propertyPrice: 1, propertyAddress: 1 }, { unique: true });

export default PropertySchema;
