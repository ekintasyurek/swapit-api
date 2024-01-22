import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";

import jwt, { JwtPayload } from "jsonwebtoken";

enum Role {
  ADMIN = "admin",
  USER = "user",
}

interface DecodedToken {
  userId: string;
  // Other properties from your decoded JWT payload
}
export interface IAuth extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  phoneNumber: number;
  city: string;
  district: string;
  neighbourhood: string;
  decodedToken?: JwtPayload | null;
}

const AuthSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    phoneNumber: { type: Number, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    neighbourhood: { type: String, required: true },
    decodedToken: { type: Object }, // DecodedToken property in the schema
  },
  {
    timestamps: true,
  }
);

AuthSchema.post<IAuth>("save", function () {
  logging.info(
    "Mongo",
    "Checkout the authentication record we just saved: ",
    this
  );
});

export default mongoose.model<IAuth>("Auth", AuthSchema);
