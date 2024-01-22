import express from "express";
import controller from "../controllers/swap";
import controller1 from "../controllers/auth";

const router = express.Router();

router.post(
  "/createSwap",
  controller1.authenticateToken,
  controller.createSwap
);
router.get(
  "/getSwaps",
  controller1.authenticateToken,
  controller1.CheckAdminRole,
  controller.getAllSwaps
);
router.get(
  "/getSwapByStatus",
  controller1.authenticateToken,
  controller.getSwapByStatus
);
router.get(
  "/getSwapById/:swapId",
  controller1.authenticateToken,
  controller.getSwapById
);
router.patch(
  "/updateSwap/:swapId",
  controller1.authenticateToken,
  controller.updateSwap
);
router.delete(
  "/deleteSwap/:swapId",
  controller1.authenticateToken,
  controller.deleteSwap
);

router.get(
  "/swapsYouOffered/:userId",
  controller1.authenticateToken,
  controller.viewSwapsYouOffered
);
router.get(
  "/swapsOfferedToYou/:userId",
  controller1.authenticateToken,
  controller.viewSwapsOfferedYou
);

router.delete(
  "/reject/:swapId",
  controller1.authenticateToken,
  controller.rejectSwap
);

router.patch(
  "/accept/:swapId",
  controller1.authenticateToken,
  controller.acceptSwap
);

router.patch(
  "/acceptQuick/:swapId",
  controller1.authenticateToken,
  controller.acceptQuickSwap
);

router.patch(
  "/rejectQuick/:swapId",
  controller1.authenticateToken,
  controller.rejectQuickSwap
);

router.patch(
  "/rateSwap/:swapId",
  controller1.authenticateToken,
  controller.rateSwap
);

export = router;
