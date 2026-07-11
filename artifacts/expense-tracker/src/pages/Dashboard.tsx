import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  TrendingUp,
  Plus
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { 
  useGetDashboardSummary, 
  useGetCategoryBreakdown, 
  useGetMonthlyTrend,
  useGetRecentTransactions,
  getGetDashboardSummaryQueryKey,
  getGetCategoryBreakdownQueryKey,
  getGetMonthlyTrendQueryKey,
  getGetRecentTransactionsQueryKey,
  TransactionType
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur border border-border p-3 rounded-lg shadow-xl">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm flex items-center gap-2" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({}, { query: { queryKey: getGetDashboardSummaryQueryKey() }});
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryBreakdown({}, { query: { queryKey: getGetCategoryBreakdownQueryKey() }});
  const { data: trend, isLoading: isLoadingTrend } = useGetMonthlyTrend({ months: 6 }, { query: { queryKey: getGetMonthlyTrendQueryKey({ months: 6 }) }});
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentTransactions({ limit: 5 }, { query: { queryKey: getGetRecentTransactionsQueryKey({ limit: 5 }) }});

  // Colors for PieChart
  const COLORS = [
    'hsl(var(--chart-1))', // Primary Green
    'hsl(var(--chart-2))', // Accent Orange
    'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 
    'hsl(var(--chart-5))',
    '#f43f5e',
    '#8b5cf6',
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Here's your financial overview.</p>
        </div>
        <Link href="/transactions">
          <Button className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1 group">
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-border/50 bg-card/40 backdrop-blur overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-4xl font-serif font-bold text-foreground">
                  {formatCurrency(summary?.totalBalance || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-border/50 bg-card/40 backdrop-blur overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-primary">
              <ArrowUpRight className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-4xl font-serif font-bold text-primary">
                  {formatCurrency(summary?.totalIncome || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/50 bg-card/40 backdrop-blur overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-accent">
              <ArrowDownRight className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="text-4xl font-serif font-bold text-accent">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Cash Flow Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingTrend ? (
                <Skeleton className="w-full h-full" />
              ) : trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }} />
                    <Bar dataKey="income" name="Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                  <p>Not enough data for trend chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingCategories ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : categories && categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                      stroke="none"
                    >
                      {categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <PieChart className="w-12 h-12 mb-4 opacity-20" />
                  <p>No categorised spending yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-serif">Recent Transactions</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-16 rounded-xl" />
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="space-y-3 mt-4">
                {recent.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === TransactionType.income ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                        {tx.type === TransactionType.income ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{tx.category}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {tx.description || formatDate(tx.date)}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${tx.type === TransactionType.income ? 'text-primary' : 'text-foreground'}`}>
                      {tx.type === TransactionType.income ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl mt-4">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No transactions yet.</p>
                <Link href="/transactions">
                  <Button variant="link" className="mt-2 text-primary">Add your first one</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
