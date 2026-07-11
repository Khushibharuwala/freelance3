import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
