import ISwap from "../interfaces/swap";
import Swap from "../models/swap";
import User from "../models/user";

export async function updateUserRate(userId: string) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const swaps: ISwap[] = await Swap.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).exec();

    let totalRating = 0;
    let ratingCount = 0;

    // Calculate the total rating and count
    for (const swap of swaps) {
      if (swap.user1.toString() === userId && swap.user1Rate) {
        totalRating += swap.user1Rate;
        ratingCount++;
      }
      if (swap.user2.toString() === userId && swap.user2Rate) {
        totalRating += swap.user2Rate;
        ratingCount++;
      }
    }

    user.rating = ratingCount > 0 ? totalRating / ratingCount : 0;
    user.isGoldenAccount = user.rating > 4.5 && ratingCount > 10;

    user.save();
  } catch (error: any) {
    throw new Error(`Failed to update user rating: ${error.message}`);
  }
}
