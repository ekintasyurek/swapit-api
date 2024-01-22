import express from "express";
import controller from "../controllers/shipping";
import controller1 from "../controllers/auth";

const router = express.Router();

router.post("/createShipping", controller.createShipping);
router.get(
  "/getShippings",
  controller1.authenticateToken,
  controller1.CheckAdminRole,
  controller.getAllShippings
);
router.get(
  "/getShippingByUserId/:userId",
  controller1.authenticateToken,
  controller.getShippingsByUserId
);
router.patch(
  "/updateShipping/:shippingId",
  controller1.authenticateToken,
  controller1.CheckAdminRole,
  controller.updateShipping
);
router.delete(
  "/deleteShipping/:shippingId",
  controller1.authenticateToken,
  controller.deleteShipping
);

export = router;
