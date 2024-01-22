import express from "express";
import controller from "../controllers/auth"; // Import the auth controller

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get(
  "/protectedRoute",
  controller.authenticateToken,
  controller.protectedRoute
);

export = router;
