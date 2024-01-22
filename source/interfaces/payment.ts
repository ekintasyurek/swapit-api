import { Document } from "mongoose";
import User from "../models/user";
import Shipping from "../models/shipping";

export default interface IPayment extends Document {
  _id: string;
  status: string;
  amount: number;
  user: typeof User;
  shipping: typeof Shipping;
}
