import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    points: number;
  }[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [String],
        correctAnswer: {
          type: Number,
          required: true,
        },
        points: {
          type: Number,
          default: 1,
        },
      },
    ],
    passingScore: {
      type: Number,
      default: 70,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

