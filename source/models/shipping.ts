import mongoose, { Schema, Types } from "mongoose";
import logging from "../config/logging";
import IShipping from "../interfaces/shipping";
import User from "./user";
import Payment from "./payment";
import Swap from "./swap";

enum status {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

const ShippingSchema: Schema = new Schema(
  {
    _id: { type: String, required: true, unique: true, generated: true },
    customerShippingId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: status,
      required: true,
      default: status.PENDING,
    },
    swap: { type: Types.ObjectId, ref: "Swap", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    payment: { type: Types.ObjectId, ref: "Payment" },
  },
  {
    timestamps: true,
  }
);

ShippingSchema.post<IShipping>("save", function () {
  logging.info("Mongo", "Checkout the shipping we just saved: ", this);
});

export default mongoose.model<IShipping>("Shipping", ShippingSchema);
