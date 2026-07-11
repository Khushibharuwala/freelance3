import { format } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch (e) {
    return dateStr;
  }
}

export const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Business", "Gift", "Other"
];

export const EXPENSE_CATEGORIES = [
  "Food", "Transport", "Housing", "Entertainment", "Healthcare", "Shopping", "Education", "Utilities", "Other"
];
