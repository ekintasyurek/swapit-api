import { Document } from "mongoose";
import Product from "../models/product";
import Swap from "../models/swap";

export default interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  phoneNumber: number;
  password: string;
  rating: number;
  isGoldenAccount: boolean;
  city: string;
  district: string;
  neighbourhood: string;
  role: string;
  products?: [typeof Product];
  swaps?: [typeof Swap];
}
