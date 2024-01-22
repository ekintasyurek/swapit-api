import mongoose from "mongoose";
import IPayment from "../interfaces/payment";
import IShipping from "../interfaces/shipping";
import Payment from "../models/payment";
import Shipping from "../models/shipping";
import Swap from "../models/swap";
import User from "../models/user";

export async function calculateShippingCost(
  user1Id: string,
  user2Id: string
): Promise<number> {
  const user1 = await User.findOne({ _id: user1Id });
  const user2 = await User.findOne({ _id: user2Id });

  if (user1!.city !== user2!.city) {
    return 100;
  } else if (user1!.district !== user2!.district) {
    return 50;
  } else if (user1!.neighbourhood !== user2!.neighbourhood) {
    return 25;
  } else {
    return 10;
  }
}

function generateCustomerShippingId(): string {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.floor(Math.random() * 10000).toString();

  const customerShippingId = `${timestamp}${randomSuffix}`;

  return customerShippingId;
}

export async function createShippingAndPayment(
  userId: string,
  swapId: string,
  amount: number,
  userChoice: string
) {
  try {
    const customerShippingId = generateCustomerShippingId();
    const shipping = new Shipping({
      _id: new mongoose.Types.ObjectId(),
      customerShippingId,
      status: "pending",
      swap: swapId,
      user: userId,
    });

    const savedShipping = await shipping.save();

    if (userChoice == "user1") {
      await Swap.updateOne({ _id: swapId }, { shipping1: savedShipping._id });
    } else {
      await Swap.updateOne({ _id: swapId }, { shipping2: savedShipping._id });
    }

    const payment = new Payment({
      _id: new mongoose.Types.ObjectId(),
      status: "pending",
      amount: amount,
      user: userId,
      shipping: savedShipping._id,
    });

    const savedPayment = await payment.save();

    await Shipping.updateOne(
      { _id: savedShipping._id },
      { payment: savedPayment._id }
    );
  } catch (error: any) {
    throw new Error("Error in creating shipping and payment: " + error.message);
  }
}
