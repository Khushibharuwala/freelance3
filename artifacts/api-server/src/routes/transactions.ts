import { Router } from "express";
import { Transaction } from "../models/Transaction.js";
import { requireAuth, AuthRequest } from "../lib/auth.js";
import {
  CreateTransactionBody,
  UpdateTransactionBody,
  ListTransactionsQueryParams,
  GetTransactionParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
} from "@workspace/api-zod";
import mongoose from "mongoose";
import type { Response } from "express";

const router = Router();

// All routes require auth
router.use(requireAuth);

// GET /api/transactions
router.get("/", async (req: AuthRequest, res: Response) => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : null;

  const filter: Record<string, unknown> = { userId: req.userId };
  if (params?.type) filter["type"] = params.type;
  if (params?.category) filter["category"] = params.category;
  if (params?.startDate || params?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (params?.startDate) dateFilter["$gte"] = new Date(params.startDate);
    if (params?.endDate) dateFilter["$lte"] = new Date(params.endDate);
    filter["date"] = dateFilter;
  }

  const limit = params?.limit ?? 50;
  const page = params?.page ?? 1;
  const skip = (page - 1) * limit;

  try {
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description ?? null,
        date: t.date,
        userId: t.userId.toString(),
        createdAt: t.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    req.log.error({ err }, "List transactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/transactions
router.post("/", async (req: AuthRequest, res: Response) => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { type, amount, category, description, date } = parsed.data;

  try {
    const tx = new Transaction({
      type,
      amount,
      category,
      description,
      date: new Date(date),
      userId: new mongoose.Types.ObjectId(req.userId),
    });
    await tx.save();
    res.status(201).json({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description ?? null,
      date: tx.date,
      userId: tx.userId.toString(),
      createdAt: tx.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Create transaction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/transactions/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const tx = await Transaction.findOne({ _id: params.data.id, userId: req.userId }).lean();
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description ?? null,
      date: tx.date,
      userId: tx.userId.toString(),
      createdAt: tx.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get transaction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/transactions/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const paramsP = UpdateTransactionParams.safeParse(req.params);
  if (!paramsP.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyP = UpdateTransactionBody.safeParse(req.body);
  if (!bodyP.success) {
    res.status(400).json({ error: bodyP.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = { ...bodyP.data };
  if (bodyP.data.date) updates["date"] = new Date(bodyP.data.date);

  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: paramsP.data.id, userId: req.userId },
      { $set: updates },
      { new: true }
    ).lean();
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description ?? null,
      date: tx.date,
      userId: tx.userId.toString(),
      createdAt: tx.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Update transaction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const tx = await Transaction.findOneAndDelete({ _id: params.data.id, userId: req.userId });
    if (!tx) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Delete transaction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
