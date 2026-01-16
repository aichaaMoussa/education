import mongoose, { Schema, Document } from 'mongoose';

export interface IStorageObject extends Document {
  bucket: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  originalFilename?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StorageObjectSchema: Schema = new Schema(
  {
    bucket: {
      type: String,
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    originalFilename: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

StorageObjectSchema.index({ bucket: 1, key: 1 }, { unique: true });
StorageObjectSchema.index({ createdAt: -1 });

export default mongoose.models.StorageObject || mongoose.model<IStorageObject>('StorageObject', StorageObjectSchema);

