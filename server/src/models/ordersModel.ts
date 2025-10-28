import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		orderItems: [
			{
				name: { type: String, required: true },
				qty: { type: Number, required: true },
				image: { type: String, required: true },
				price: { type: Number, required: true },
				product: {
					type: String, // Changed to String to handle both ObjectId and external IDs
					required: true
				},
			},
		],
		shippingAddress: {
			address: { type: String, required: true },
			city: { type: String, required: true },
			postalCode: { type: String, required: true },
			country: { type: String, required: true },
		},
		paymentMethod: {
			type: String,
			required: true,
		},
		paymentResult: {
			id: { type: String },
			status: { type: String },
			update_time: { type: String },
			email_address: { type: String },
		},
		taxPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		shippingPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		totalPrice: {
			type: Number,
			required: true,
			default: 0.0,
		},
		isPaid: {
			type: Boolean,
			required: true,
			default: false,
		},
		paidAt: {
			type: Date,
		},
		isDelivered: {
			type: Boolean,
			required: true,
			default: false,
		},
		deliveredAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Virtuals to align with FR014 response shape without breaking existing fields
// userId mirrors user
orderSchema.virtual('userId').get(function(this: any) {
	return this.user;
});

// products maps orderItems -> { productId, quantity }
orderSchema.virtual('products').get(function(this: any) {
	if (!Array.isArray(this.orderItems)) return [];
	return this.orderItems.map((it: any) => ({
		productId: it.product, // may be an external id string in this app
		quantity: it.qty,
	}));
});

// total mirrors totalPrice
orderSchema.virtual('total').get(function(this: any) {
	return typeof this.totalPrice === 'number' ? this.totalPrice : 0;
});

// Response shaping: map _id -> id, drop __v, include virtuals
orderSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: (_doc, ret: any) => {
		ret.id = ret._id;
		delete ret._id;
		return ret;
	}
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
