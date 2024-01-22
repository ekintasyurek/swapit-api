import express from "express";
import controller from "../controllers/product";
import controller1 from "../controllers/auth";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/createProduct",
  controller1.authenticateToken,
  // upload.single("image"),
  controller.createProduct
);
router.get(
  "/getProducts",
  controller1.authenticateToken,
  controller.getAllProducts
);
router.get(
  "/getProductByCategory",
  controller1.authenticateToken,
  controller.getProductByCategory
);
router.get(
  "/getProductById/:productId",
  controller1.authenticateToken,
  controller.getProductById
);
router.get(
  "/getProductByUserId/:userId",
  controller1.authenticateToken,
  controller.getProductByUserId
);
router.patch(
  "/updateProduct/:productId",
  controller1.authenticateToken,
  controller.updateProduct
);
router.delete(
  "/deleteProduct/:productId",
  controller1.authenticateToken,
  controller.deleteProduct
);

router.get(
  "/searchProducts",
  controller.searchProduct
);

export = router;
