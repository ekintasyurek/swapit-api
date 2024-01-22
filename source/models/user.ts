import mongoose, { Schema, Types } from "mongoose";
import logging from "../config/logging";
import IUser from "../interfaces/user";
import Product from "./product";
import Swap from "./swap";

enum role {
  ADMIN = "admin",
  USER = "user",
}

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true, unique: true, generated: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    rating: { type: Number, default: 2.5 },
    isGoldenAccount: { type: Boolean, default: false },
    city: { type: String, required: true },
    district: { type: String, required: true },
    neighbourhood: { type: String, required: true },
    role: { type: String, enum: role, required: true },
    products: [{ type: Types.ObjectId, ref: "Product" }],
    swaps: [{ type: Types.ObjectId, ref: "Swap" }],
  },
  {
    timestamps: true,
  }
);

UserSchema.post<IUser>("save", function () {
  logging.info("Mongo", "Checkout the user we just saved: ", this);
});

export default mongoose.model<IUser>("User", UserSchema);
