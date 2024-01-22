import mongoose, { Schema, Types } from "mongoose";
import logging from "../config/logging";
import IProduct from "../interfaces/product";
import User from "./user";
import Swap from "./swap";

enum category {
  FURNITURE = "furniture",
  CLOTHING = "clothing",
  BOOK = "book",
  TECHNOLOGY = "technology",
}

const ProductSchema: Schema = new Schema(
  {
    _id: { type: String, required: true, unique: true, generated: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: category, required: true },
    imageUrl: { type: String },
    user: { type: Types.ObjectId, ref: "User", required: true },
    swap: { type: Types.ObjectId, ref: "Swap" },
  },
  {
    timestamps: true,
  }
);

ProductSchema.post<IProduct>("save", function () {
  logging.info("Mongo", "Checkout the product we just saved: ", this);
});

export default mongoose.model<IProduct>("Product", ProductSchema);
