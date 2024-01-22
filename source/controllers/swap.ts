import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Swap from "../models/swap";
import User from "../models/user";
import Product from "../models/product";
import {
  calculateShippingCost,
  createShippingAndPayment,
} from "../services/swap.service";
import { updateUserRate } from "../services/user.service";

interface UpdateOps {
  propName: string;
  value: any;
}

interface CustomRequest extends Request {
  user?: { _id: string; [key: string]: any }; // Adjust the type according to your user object structure
}

const createSwap = async (req: Request, res: Response, next: NextFunction) => {
  const { product1, product2, user1, user2 } = req.body;

  try {
    const swap = new Swap({
      _id: new mongoose.Types.ObjectId(),
      product1,
      product2,
      user1,
      user2,
      status: "pending",
      quickSwapStatus: "pending",
    });

    const savedSwap = await swap.save();

    await User.updateOne({ _id: user1 }, { $push: { swaps: savedSwap._id } });
    await User.updateOne({ _id: user2 }, { $push: { swaps: savedSwap._id } });

    await Product.updateOne(
      { _id: product1 },
      { $set: { swap: savedSwap._id } }
    );
    await Product.updateOne(
      { _id: product2 },
      { $set: { swap: savedSwap._id } }
    );

    return res.status(201).json({
      swap: savedSwap,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const getAllSwaps = (req: Request, res: Response, next: NextFunction) => {
  Swap.find()
    .exec()
    .then((swaps) => {
      return res.status(200).json({
        swaps: swaps,
        count: swaps.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getSwapByStatus = (req: Request, res: Response, next: NextFunction) => {
  const status = req.params.status;

  Swap.find({ status: status })
    .exec()
    .then((swaps) => {
      return res.status(200).json({
        swaps: swaps,
        count: swaps.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getSwapById = (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;

  Swap.findById(swapId)
    .exec()
    .then((swap) => {
      if (!swap) {
        return res.status(404).json({
          message: "Swap not found",
        });
      }

      return res.status(200).json({
        swap: swap,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const updateSwap = (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;
  const updateOps: { [key: string]: any } = {};

  for (const ops of req.body as UpdateOps[]) {
    updateOps[ops.propName] = ops.value;
  }

  Swap.updateOne({ _id: swapId }, { $set: updateOps })
    .exec()
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: "Swap updated successfully",
        });
      } else {
        return res.status(404).json({
          message: "Swap not found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const deleteSwap = (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;

  Swap.deleteOne({ _id: swapId })
    .exec()
    .then((result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({
          message: "Swap deleted successfully",
        });
      } else {
        return res.status(404).json({
          message: "Swap not found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const viewSwapsYouOffered = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let userId = req.params.userId;
  if (userId) userId = userId.trim();

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const swaps = await Swap.find({ user1: userId }).exec(); // Find swaps where the provided ID is user1
    return res.status(200).json({
      swaps: swaps,
      count: swaps.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const viewSwapsOfferedYou = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  console.log("User ID:", userId);
  if (!userId) {
    console.log("User ID:", userId);
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const swaps = await Swap.find({ user2: userId }).exec(); // Find swaps where the provided ID is user1
    return res.status(200).json({
      swaps: swaps,
      count: swaps.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const rejectSwap = async (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;
  const userId = (req as any).userId; // Extracting userId from query

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    if (swap.user2.toString() !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Swap.deleteOne({ _id: swapId });
    await Product.updateMany(
      { _id: { $in: [swap.product1, swap.product2] } },
      { $unset: { swap: "" } }
    );

    return res.status(200).json({ message: "Swap rejected successfully" });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const acceptSwap = async (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;
  const userId = (req as any).userId;

  try {
    const swap = await Swap.findById(swapId).exec();
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    if (swap.user2.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept this swap" });
    }

    const user1 = await User.findById(swap.user1).exec();
    const user2 = await User.findById(swap.user2).exec();

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    let quickSwapStatus = swap.quickSwapStatus;
    if (user1.neighbourhood === user2.neighbourhood) {
      quickSwapStatus = "pending";
    }

    await Swap.updateOne(
      { _id: swapId },
      { $set: { status: "accepted", quickSwapStatus: quickSwapStatus } }
    ).exec();

    return res.status(200).json({ message: "Swap accepted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const acceptQuickSwap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const swapId = req.params.swapId;
  const currentUserId = (req as any).userId; // Obtaining userId from the query parameter

  try {
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    const user1 = await User.findById(swap.user1);
    const user2 = await User.findById(swap.user2);

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    // Quick swap acceptance logic
    if (
      currentUserId === user2._id.toString() &&
      swap.quickSwapStatus === "acceptedByUser1"
    ) {
      swap.quickSwapStatus = "acceptedByBoth";
    } else if (
      currentUserId === user2._id.toString() &&
      swap.quickSwapStatus === "pending"
    ) {
      swap.quickSwapStatus = "acceptedByUser2";
    } else if (
      currentUserId === user1._id.toString() &&
      swap.quickSwapStatus === "acceptedByUser2"
    ) {
      swap.quickSwapStatus = "acceptedByBoth";
    } else if (
      currentUserId === user1._id.toString() &&
      swap.quickSwapStatus === "pending"
    ) {
      swap.quickSwapStatus = "acceptedByUser1";
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept this swap" });
    }

    await swap.save();

    res.status(200).json({
      message: "QuickSwap accepted successfully",
      swap,
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting QuickSwap", error });
  }
};

const rejectQuickSwap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const swapId = req.params.swapId;
    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    const user1Id = swap.user1.toString();
    const user2Id = swap.user2.toString();

    swap.quickSwapStatus = "rejected";
    await swap.save();

    const amount = await calculateShippingCost(user1Id, user2Id);
    await createShippingAndPayment(user1Id, swap._id, amount, "user1");
    await createShippingAndPayment(user2Id, swap._id, amount, "user2");

    return res.status(200).json({ message: "Swap rejected successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "An error occurred: " + error.message });
  }
};

const rateSwap = async (req: Request, res: Response, next: NextFunction) => {
  const swapId = req.params.swapId;
  const userId = (req as any).userId;
  const { rate } = req.body;
  const updateOps: { [key: string]: any } = {};

  const swapToBeUpdated = await Swap.findById(swapId).populate(
    "user1 user2",
    "_id"
  );

  if (!swapToBeUpdated) {
    return res.status(404).json({
      message: "Swap not found",
    });
  }

  let userToBeUpdated: string;

  const user1Id = swapToBeUpdated.get("user1._id").toString();
  const user2Id = swapToBeUpdated.get("user2._id").toString();

  if (userId == user1Id) {
    updateOps["rate2"] = rate;
    userToBeUpdated = user2Id;
  } else if (userId == user2Id) {
    updateOps["rate1"] = rate;
    userToBeUpdated = user1Id;
  } else {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  Swap.updateOne({ _id: swapId }, { $set: updateOps })
    .exec()
    .then(() => {
      updateUserRate(userToBeUpdated);
      return res.status(200).json({
        message: "Swap updated successfully",
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

export default {
  createSwap,
  getAllSwaps,
  getSwapByStatus,
  getSwapById,
  updateSwap,
  deleteSwap,
  viewSwapsYouOffered,
  viewSwapsOfferedYou,
  rejectSwap,
  acceptSwap,
  acceptQuickSwap,
  rejectQuickSwap,
  rateSwap,
};
