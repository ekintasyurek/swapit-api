import mongoose, { Schema, Types } from "mongoose";
import logging from "../config/logging";
import IPayment from "../interfaces/payment";
import User from "./user";
import Shipping from "./shipping";

enum status {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

const PaymentSchema: Schema = new Schema(
  {
    _id: { type: String, required: true, unique: true, generated: true },
    status: {
      type: String,
      enum: status,
      required: true,
      default: status.PENDING,
    },
    amount: { type: Number, required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    shipping: { type: Types.ObjectId, ref: "Shipping" },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.post<IPayment>("save", function () {
  logging.info("Mongo", "Checkout the payment we just saved: ", this);
});

export default mongoose.model<IPayment>("Payment", PaymentSchema);
