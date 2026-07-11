import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import transactionsRouter from "./transactions.js";
import dashboardRouter from "./dashboard.js";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/transactions", transactionsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
