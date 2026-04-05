import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  student?: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  walletType: string;
  phoneNumber: string;
  amount: number;
  paidAt: Date;
  /** Référence transaction fournisseur (ex. Bankily) */
  providerTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    walletType: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    providerTransactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ student: 1, paidAt: -1 });
TransactionSchema.index({ course: 1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
