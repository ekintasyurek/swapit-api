import http from "http";
import bodyParser from "body-parser";
import express from "express";
import logging from "./config/logging";
import config from "./config/config";
import productRoutes from "./routes/product";
import swapRoutes from "./routes/swap";
import userRoutes from "./routes/user";
import paymentRoutes from "./routes/payment";
import shippingRoutes from "./routes/shipping";
import authRoutes from "./routes/auth";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

const NAMESPACE = "Server";
const router = express();
const cors = require("cors");

router.use(cors());

/** Connect to Mongo */
mongoose
  .connect(config.mongo.url, config.mongo.options)
  .then((result) => {
    logging.info(NAMESPACE, "Mongo Connected");
  })
  .catch((error) => {
    logging.error(NAMESPACE, error.message, error);
  });

/** Log the request */
router.use((req, res, next) => {
  /** Log the req */
  logging.info(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    /** Log the res */
    logging.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
});

/** Parse the body of the request */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** Rules of our API */
// router.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );

//   if (req.method == "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
//     return res.status(200).json({});
//   }

//   next();
// });

/** Routes go here */
router.use("/api/products", productRoutes);
router.use("/api/swaps", swapRoutes);
router.use("/api/users", userRoutes);
router.use("/api/payments", paymentRoutes);
router.use("/api/shippings", shippingRoutes);
router.use("/api/auths", authRoutes);

export default router;

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("Not found");

  res.status(404).json({
    message: error.message,
  });
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () =>
  logging.info(
    NAMESPACE,
    `Server is running ${config.server.hostname}:${config.server.port}`
  )
);
