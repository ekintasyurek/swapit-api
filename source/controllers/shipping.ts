import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Shipping from "../models/shipping";
import Swap from "../models/swap";

interface UpdateOps {
  propName: string;
  value: any;
}

const createShipping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { customerShippingId, status, swap, user, payment } = req.body;

  try {
    const shipping = new Shipping({
      _id: new mongoose.Types.ObjectId(),
      customerShippingId,
      status: status || "pending",
      swap,
      user,
      payment,
    });

    const savedShipping = await shipping.save();

    const swapToUpdate = await Swap.findOne({ _id: swap });

    if (!swapToUpdate) {
      return res.status(404).json({
        message: "Corresponding swap not found",
      });
    }

    if (String(swapToUpdate.user1) === String(user)) {
      await Swap.updateOne(
        { _id: swapToUpdate._id },
        { $set: { shipping1: savedShipping._id } }
      );
    } else {
      await Swap.updateOne(
        { _id: swapToUpdate._id },
        { $set: { shipping2: savedShipping._id } }
      );
    }

    return res.status(201).json({
      shipping: savedShipping,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const getAllShippings = (req: Request, res: Response, next: NextFunction) => {
  Shipping.find()
    .exec()
    .then((shippings) => {
      return res.status(200).json({
        shippings: shippings,
        count: shippings.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getShippingsByUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  Shipping.find({ user: userId })
    .exec()
    .then((shippings) => {
      return res.status(200).json({
        shippings: shippings,
        count: shippings.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const updateShipping = (req: Request, res: Response, next: NextFunction) => {
  const shippingId = req.params.shippingId;
  const updateOps: { [key: string]: any } = {};

  for (const ops of req.body as UpdateOps[]) {
    updateOps[ops.propName] = ops.value;
  }

  Shipping.updateOne({ _id: shippingId }, { $set: updateOps })
    .exec()
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: "Shipping updated successfully",
        });
      } else {
        return res.status(404).json({
          message: "Shipping not found",
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

const deleteShipping = (req: Request, res: Response, next: NextFunction) => {
  const shippingId = req.params.shippingId;

  Shipping.deleteOne({ _id: shippingId })
    .exec()
    .then((result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({
          message: "Shipping deleted successfully",
        });
      } else {
        return res.status(404).json({
          message: "Shipping not found",
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

export default {
  createShipping,
  getAllShippings,
  getShippingsByUserId,
  updateShipping,
  deleteShipping,
};
