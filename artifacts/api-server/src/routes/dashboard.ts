import { Router } from "express";
import { Transaction } from "../models/Transaction.js";
import { requireAuth, AuthRequest } from "../lib/auth.js";
import {
  GetDashboardSummaryQueryParams,
  GetCategoryBreakdownQueryParams,
  GetMonthlyTrendQueryParams,
  GetRecentTransactionsQueryParams,
} from "@workspace/api-zod";
import type { Response } from "express";

const router = Router();
router.use(requireAuth);

// GET /api/dashboard/summary
router.get("/summary", async (req: AuthRequest, res: Response) => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : null;

  const now = new Date();
  const month = params?.month ?? now.getMonth() + 1;
  const year = params?.year ?? now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  try {
    const mongoose = await import("mongoose");
    const userObjId = new mongoose.Types.ObjectId(req.userId);

    const [monthResult, allTimeResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]),
    ]);

    type AggItem = { _id: string; total: number; count?: number };
    const byType = (arr: AggItem[]) =>
      arr.reduce(
        (acc, item) => {
          acc[item._id] = { total: item.total, count: item.count ?? 0 };
          return acc;
        },
        {} as Record<string, { total: number; count: number }>
      );

    const monthly = byType(monthResult as AggItem[]);
    const allT = byType(allTimeResult as AggItem[]);

    const totalIncome = monthly["income"]?.total ?? 0;
    const totalExpenses = monthly["expense"]?.total ?? 0;
    const allTimeIncome = allT["income"]?.total ?? 0;
    const allTimeExpenses = allT["expense"]?.total ?? 0;
    const totalBalance = allTimeIncome - allTimeExpenses;
    const transactionCount = (monthly["income"]?.count ?? 0) + (monthly["expense"]?.count ?? 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    res.json({ totalBalance, totalIncome, totalExpenses, transactionCount, savingsRate });
  } catch (err) {
    req.log.error({ err }, "Dashboard summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/category-breakdown
router.get("/category-breakdown", async (req: AuthRequest, res: Response) => {
  const parsed = GetCategoryBreakdownQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const now = new Date();
  const month = params.month ?? now.getMonth() + 1;
  const year = params.year ?? now.getFullYear();
  const type = params.type ?? "expense";

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  try {
    const mongoose = await import("mongoose");
    const userObjId = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { userId: userObjId, type, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    const total = result.reduce((sum, item) => sum + item.amount, 0);
    const breakdown = result.map((item) => ({
      category: item._id,
      amount: item.amount,
      count: item.count,
      percentage: total > 0 ? (item.amount / total) * 100 : 0,
    }));

    res.json(breakdown);
  } catch (err) {
    req.log.error({ err }, "Category breakdown error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/monthly-trend
router.get("/monthly-trend", async (req: AuthRequest, res: Response) => {
  const parsed = GetMonthlyTrendQueryParams.safeParse(req.query);
  const numMonths = parsed.success ? (parsed.data.months ?? 6) : 6;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1);

  try {
    const mongoose = await import("mongoose");
    const userObjId = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { userId: userObjId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build map of year-month -> { income, expenses }
    const map = new Map<string, { income: number; expenses: number }>();
    for (let i = 0; i < numMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - numMonths + 1 + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, { income: 0, expenses: 0 });
    }

    for (const item of result) {
      const key = `${item._id.year}-${item._id.month}`;
      const entry = map.get(key);
      if (entry) {
        if (item._id.type === "income") entry.income = item.total;
        else entry.expenses = item.total;
      }
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trend = Array.from(map.entries()).map(([key, val]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        month: month!,
        year: year!,
        label: `${monthNames[(month! - 1)]} ${year}`,
        income: val.income,
        expenses: val.expenses,
        balance: val.income - val.expenses,
      };
    });

    res.json(trend);
  } catch (err) {
    req.log.error({ err }, "Monthly trend error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/recent-transactions
router.get("/recent-transactions", async (req: AuthRequest, res: Response) => {
  const parsed = GetRecentTransactionsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 5) : 5;

  try {
    const mongoose = await import("mongoose");
    const userObjId = new mongoose.Types.ObjectId(req.userId);

    const transactions = await Transaction.find({ userId: userObjId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    res.json(
      transactions.map((t) => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description ?? null,
        date: t.date,
        userId: t.userId.toString(),
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Recent transactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
