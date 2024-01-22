import express from "express";
import controller from "../controllers/payment";
import controller1 from "../controllers/auth";

const router = express.Router();

router.post(
  "/createPayment",
  controller1.authenticateToken,
  controller.createPayment
);
router.get(
  "/getPayments",
  controller1.authenticateToken,
  controller1.CheckAdminRole,
  controller.getAllPayments
);
router.get(
  "/getPaymentByUserId/:userId",
  controller1.authenticateToken,
  controller.getPaymentsByUserId
);
router.patch(
  "/updatePayment/:paymentId",
  controller1.authenticateToken,
  controller.updatePayment
);
router.delete(
  "/deletePayment/:paymentId",
  controller1.authenticateToken,
  controller.deletePayment
);

export = router;
