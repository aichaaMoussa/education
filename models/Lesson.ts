import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  course: mongoose.Types.ObjectId;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

