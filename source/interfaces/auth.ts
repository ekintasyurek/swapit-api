import { Document } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
export interface IAuth extends Document {
  email: string;
  password: string;
  name: string;
  phoneNumber: number;
  city: string;
  district: string;
  neighbourhood: string;
}

export interface MyJwtPayload extends JwtPayload {
  userId: string; // Add other properties if needed
}
