import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/product";
import User from "../models/user";
import { uploadImageToStorage } from "../services/storage.service";

interface UpdateOps {
  propName: string;
  value: any;
}

interface ProductQuery {
  name?: { $regex: RegExp };
  category?: string;
}

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).userId;
  const { name, description, user, category, imageUrl } = req.body;

  // const imageData = req.file!.buffer;
  // const metadata = req.body.metadata; // Metadata sent along with the image
  // let imageUrl = "";

  // try {
  //   imageUrl = await uploadImageToStorage(imageData, metadata);
  // } catch (error) {
  //   console.error("Error:", error);
  //   res.status(500).json({ error: "Internal server error" });
  // }

  try {
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      user,
      category,
      imageUrl,
    });

    const savedProduct = await product.save();

    await User.updateOne(
      { _id: userId },
      { $push: { products: savedProduct._id } }
    );

    //await User.findByIdAndUpdate(userId, { $push: { products: savedProduct._id } });

    return res.status(201).json({
      product: savedProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const getAllProducts = (req: Request, res: Response, next: NextFunction) => {
  Product.find()
    .exec()
    .then((products) => {
      return res.status(200).json({
        products: products,
        count: products.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getProductByCategory = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const category = req.params.category;

  Product.find({ category: category })
    .exec()
    .then((products) => {
      return res.status(200).json({
        products: products,
        count: products.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getProductById = (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        product: product,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getProductByUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  Product.find({ user: userId })
    .exec()
    .then((products) => {
      return res.status(200).json({
        products: products,
        count: products.length,
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params.productId;
  const updateOps: { [key: string]: any } = {};

  for (const ops of req.body as UpdateOps[]) {
    updateOps[ops.propName] = ops.value;
  }

  Product.updateOne({ _id: productId }, { $set: updateOps })
    .exec()
    .then((result) => {
      if (result.modifiedCount > 0) {
        return res.status(200).json({
          message: "Product updated successfully",
        });
      } else {
        return res.status(404).json({
          message: "Product not found",
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

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ _id: productId });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const searchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let name = req.query.name as string | undefined;
  let category = req.query.category as string | undefined;

  if (!name && !category) {
    return res.status(400).json({ message: "No search parameters provided" });
  }
  if (name) name = name.trim();
  if (category) category = category.trim();

  let query: ProductQuery = {};
  if (name) {
    query["name"] = { $regex: new RegExp(name, "i") };
  }
  if (category) {
    query["category"] = category;
  }

  console.log("Name:", name);
  console.log("Category:", category);
  console.log("Constructed Query:", query);

  try {
    const products = await Product.find(query).exec();
    return res.status(200).json({
      products: products,
      count: products.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
      error,
    });
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductByCategory,
  getProductById,
  getProductByUserId,
  updateProduct,
  deleteProduct,
  searchProduct,
};
