import express from "express";
import controller from "../controllers/user";
import controller1 from "../controllers/auth";
const router = express.Router();

router.post(
  "/createUser",
  controller1.authenticateToken,
  controller1.CheckAdminRole,
  controller.createUser
);
router.get("/getUsers", controller1.authenticateToken, controller.getAllUsers);
router.get(
  "/getUserById/:userId",
  controller1.authenticateToken,
  controller.getUserById
);
router.patch(
  "/updateUser/:userId",
  controller1.authenticateToken,
  controller.updateUser
);
router.delete(
  "/deleteUser/:userId",
  controller1.authenticateToken,
  controller.deleteUser
);

export = router;
