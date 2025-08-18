import { Schema } from 'mongoose';
import { MyBooked } from '../libs/enums/listing.enum';

const ListingSchema = new Schema(
	{
		myBooked: {
			type: String,
			enum: MyBooked,
			default:MyBooked.PAUSED
		},

		propertyId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Property',
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
		memberBookedCount:{
			type:Number,
			default:1
		}
	},
	{ timestamps: true, collection: 'listings' },
);

ListingSchema.index({ memberId: 1, propertyId: 1 }, { unique: true });

export default ListingSchema;
