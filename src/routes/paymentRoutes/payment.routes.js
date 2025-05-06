const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const paymentController = require("../../controllers/paymentControllers/payment.controllers.js");
const router = express.Router();

router.post(
  "/payment-process",
  authMiddleware,
  paymentController.processPaymentController
);

router.post("/payment-verify", authMiddleware, paymentController.verifyPaymentController);

module.exports = router;
