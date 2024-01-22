import { Document } from "mongoose";
import Product from "../models/product";
import User from "../models/user";
import Shipping from "../models/shipping";

export default interface ISwap extends Document {
  _id: string;
  product1: typeof Product;
  product2: typeof Product;
  user1: typeof User;
  user2: typeof User;
  status: string;
  quickSwapStatus?: string;
  shipping1?: typeof Shipping;
  shipping2?: typeof Shipping;
  user1Rate?: number;
  user2Rate?: number;
}
