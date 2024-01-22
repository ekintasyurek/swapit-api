import { Document } from "mongoose";
import User from "../models/user";
import Swap from "../models/swap";

export default interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  user: typeof User;
  swap?: typeof Swap;
}
interface CustomRequest extends Request {
  userId?: string; // Add the userId property to represent the extracted user ID
}
