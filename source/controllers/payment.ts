import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/payment";
import Shipping from "../models/shipping";

interface UpdateOps {
  propName: string;
  value: any;
}

const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, amount, user, shipping } = req.body;
  //const userId = (req as any).userId;
  try {
    const payment = new Payment({
      _id: new mongoose.Types.ObjectId(),
      status: status || "pending",
      amount,
      user,
      shipping,
    });

    const savedPayment = await payment.save();

    await Shipping.updateOne(
      { _id: shipping },
      { $set: { payment: savedPayment._id } }
    );

    return res.status(201).json({
      payment: savedPayment,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const getAllPayments = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  Payment.find({ user: userId })
    .exec()
    .then((payments) => {
      return res.status(200).json({
        payments: payments,
        count: payments.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getPaymentsByUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  Payment.find({ user: userId })
    .exec()
    .then((payments) => {
      return res.status(200).json({
        payments: payments,
        count: payments.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const updatePayment = (req: Request, res: Response, next: NextFunction) => {
  const paymentId = req.params.paymentId;
  const updateOps: { [key: string]: any } = {};

  for (const ops of req.body as UpdateOps[]) {
    updateOps[ops.propName] = ops.value;
  }

  Payment.updateOne({ _id: paymentId }, { $set: updateOps })
    .exec()
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: "Payment updated successfully",
        });
      } else {
        return res.status(404).json({
          message: "Payment not found",
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

const deletePayment = (req: Request, res: Response, next: NextFunction) => {
  const paymentId = req.params.paymentId;

  Payment.deleteOne({ _id: paymentId })
    .exec()
    .then((result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({
          message: "Payment deleted successfully",
        });
      } else {
        return res.status(404).json({
          message: "Payment not found",
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
  createPayment,
  getAllPayments,
  getPaymentsByUserId,
  updatePayment,
  deletePayment,
};
