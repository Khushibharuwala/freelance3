import React, { useState, useCallback, useMemo } from "react";
import { 
  useListTransactions, 
  useCreateTransaction, 
  useUpdateTransaction, 
  useDeleteTransaction,
  useGetTransaction,
  getListTransactionsQueryKey,
  getGetTransactionQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetCategoryBreakdownQueryKey,
  getGetRecentTransactionsQueryKey,
  getGetMonthlyTrendQueryKey,
  TransactionType,
  Transaction,
  ListTransactionsType
} from "@workspace/api-client-react";
import { formatCurrency, formatDate, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { 
  Plus, Search, ArrowUpRight, ArrowDownRight, 
  MoreHorizontal, Pencil, Trash2, Loader2, Wallet,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { format } from "date-fns";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries & Params
  const queryParams = useMemo(() => {
    const params: any = { page, limit: 15 };
    if (filterType !== "all") params.type = filterType as ListTransactionsType;
    if (filterCategory !== "all") params.category = filterCategory;
    return params;
  }, [page, filterType, filterCategory]);

  const { data: txData, isLoading } = useListTransactions(queryParams, { 
    query: { queryKey: getListTransactionsQueryKey(queryParams), placeholderData: (prev: any) => prev } 
  });

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  // Form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const formType = form.watch("type");

  const invalidateDashboardQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCategoryBreakdownQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentTransactionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
  }, [queryClient]);

  const openAddModal = () => {
    setEditingTx(null);
    form.reset({
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    form.reset({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || "",
      date: format(new Date(tx.date), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: TransactionFormValues) => {
    if (editingTx) {
      updateTx.mutate({
        id: editingTx.id,
        data: values
      }, {
        onSuccess: () => {
          toast({ title: "Transaction updated" });
          setIsModalOpen(false);
          invalidateDashboardQueries();
        },
        onError: () => toast({ variant: "destructive", title: "Failed to update transaction" })
      });
    } else {
      createTx.mutate({
        data: values
      }, {
        onSuccess: () => {
          toast({ title: "Transaction created" });
          setIsModalOpen(false);
          invalidateDashboardQueries();
        },
        onError: () => toast({ variant: "destructive", title: "Failed to create transaction" })
      });
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    deleteTx.mutate({ id: deletingId }, {
      onSuccess: () => {
        toast({ title: "Transaction deleted" });
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        invalidateDashboardQueries();
      },
      onError: () => toast({ variant: "destructive", title: "Failed to delete transaction" })
    });
  };

  const totalPages = txData ? Math.ceil(txData.total / txData.limit) : 1;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transaction history.</p>
        </div>
        <Button onClick={openAddModal} className="rounded-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/40 backdrop-blur">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full flex items-center gap-4">
            <Select value={filterType} onValueChange={(val) => { setFilterType(val); setPage(1); setFilterCategory("all"); }}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={(val) => { setFilterCategory(val); setPage(1); }} disabled={filterType === "all"}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(filterType === "income" ? INCOME_CATEGORIES : filterType === "expense" ? EXPENSE_CATEGORIES : []).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="border-border/50 bg-card/20 backdrop-blur overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
          </div>
        ) : !txData?.transactions.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or add a new transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {txData.transactions.map((tx) => (
              <motion.div 
                key={tx.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tx.type === TransactionType.income ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {tx.type === TransactionType.income ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-lg">{tx.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(tx.date)} {tx.description && <span className="hidden sm:inline"> • {tx.description}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`font-serif font-bold text-xl ${tx.type === TransactionType.income ? 'text-primary' : 'text-foreground'}`}>
                    {tx.type === TransactionType.income ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openEditModal(tx)} className="cursor-pointer">
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => { setDeletingId(tx.id); setIsDeleteModalOpen(true); }}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {txData && txData.total > 0 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between bg-card/40">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * txData.limit + 1} to {Math.min(page * txData.limit, txData.total)} of {txData.total}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editingTx ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("category", ""); // reset category when type changes
                        }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(formType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Grocery shopping..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTx.isPending || updateTx.isPending}>
                  {(createTx.isPending || updateTx.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingTx ? "Save Changes" : "Create Transaction"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              and update your dashboard totals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={deleteTx.isPending}>
              {deleteTx.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
