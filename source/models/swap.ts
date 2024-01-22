import mongoose, { Schema, Types } from "mongoose";
import logging from "../config/logging";
import ISwap from "../interfaces/swap";
import Product from "./product";
import User from "./user";
import Shipping from "./shipping";

enum status {
  PENDING = "pending",
  ACCEPTED = "accepted",
}

enum quickSwapStatus {
  ACCEPTED_BY_BOTH = "acceptedByBoth",
  ACCEPTED_BY_USER1 = "acceptedByUser1",
  ACCEPTED_BY_USER2 = "acceptedByUser2",
  REJECTED = "rejected",
  PENDING = "pending",
}

const SwapSchema: Schema = new Schema(
  {
    _id: { type: String, required: true, unique: true, generated: true },
    product1: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    product2: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user1: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: status,
      required: true,
      default: status.PENDING,
    },
    quickSwapStatus: { type: String, enum: quickSwapStatus },
    shipping1: {
      type: Types.ObjectId,
      ref: "Shipping",
    },
    shipping2: {
      type: Types.ObjectId,
      ref: "Shipping",
    },
    user1Rate: { type: Number }, //Rate given by user2 to user1
    user2Rate: { type: Number }, //Rate given by user1 to user2
  },
  {
    timestamps: true,
  }
);

SwapSchema.post<ISwap>("save", function () {
  logging.info("Mongo", "Checkout the swap we just saved: ", this);
});

export default mongoose.model<ISwap>("Swap", SwapSchema);
