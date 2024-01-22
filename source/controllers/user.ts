import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";
import * as bcrypt from "bcrypt";
interface UpdateOps {
  propName: string;
  value: any;
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const {
    email,
    name,
    phoneNumber,
    password,
    rating,
    isGoldenAccount,
    city,
    district,
    neighbourhood,
    role,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      name,
      phoneNumber,
      password: hashedPassword,
      rating: rating || 2.5,
      isGoldenAccount: isGoldenAccount || false,
      city,
      district,
      neighbourhood,
      role,
    });

    return user.save().then((result) => {
      return res.status(201).json({
        user: result,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find()
    .populate("products") // Populate products array with actual product documents
    .populate("swaps") // Populate swaps array with actual swap documents
    .exec()
    .then((users) => {
      return res.status(200).json({
        users: users,
        count: users.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getUserById = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  User.findById(userId)
    .populate("products") // Populate products array with actual product documents
    .populate("swaps") // Populate swaps array with actual swap documents
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        user: user,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const updateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const updateOps: { [key: string]: any } = {};

  for (const ops of req.body as UpdateOps[]) {
    updateOps[ops.propName] = ops.value;
  }

  User.updateOne({ _id: userId }, { $set: updateOps })
    .exec()
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: "User updated successfully",
        });
      } else {
        return res.status(404).json({
          message: "User not found",
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

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  User.deleteOne({ _id: userId })
    .exec()
    .then((result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({
          message: "User deleted successfully",
        });
      } else {
        return res.status(404).json({
          message: "User not found",
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
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
