import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import IAuth from "../models/auth";

const jwtSecret = "your-secret-key";

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name, phoneNumber, city, district, neighbourhood } =
    req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }] });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      city,
      district,
      neighbourhood,
      role: "user",
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: (error as Error).message,
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, {
        expiresIn: "1h",
      });
      res.status(200).json({
        message: "Login successful",
        token,
        role: user.role,
        user: user,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during login",
      error: (error as Error).message,
    });
  }
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" });
  }

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err || !decodedToken || typeof decodedToken === "string") {
      return res.status(401).json({ message: "Not authorized" });
    }

    (req as any).decodedToken = decodedToken;
    // In authenticateToken middleware
    const userId = decodedToken.userId;
    const userRole = decodedToken.role;

    (req as any).userId = userId;
    (req as any).userRole = userRole;

    next();
  });
};

const CheckAdminRole = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied: requires admin privileges" });
  }

  next();
};

const protectedRoute = (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    res
      .status(200)
      .json({ message: "Access granted to the protected route", userId });
  } catch (error) {
    res.status(500).json({
      message: "Error in the protected route",
      error: (error as Error).message,
    });
  }
};

export default {
  register,
  login,
  authenticateToken,
  CheckAdminRole,
  protectedRoute,
};
