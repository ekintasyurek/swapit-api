import { Document } from "mongoose";
import User from "../models/user";
import Payment from "../models/payment";
import Swap from "../models/swap";

export default interface IShipping extends Document {
  _id: string;
  customerShippingId: string;
  status: string;
  swap: typeof Swap;
  user: typeof User;
  payment?: typeof Payment;
}
