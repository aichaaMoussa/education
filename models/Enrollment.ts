import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  progress: {
    lessonsCompleted: mongoose.Types.ObjectId[];
    quizzesCompleted: mongoose.Types.ObjectId[];
    progressPercentage: number;
  };
  purchasedAt: Date;
  pricePaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    progress: {
      lessonsCompleted: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Lesson',
        },
      ],
      quizzesCompleted: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Quiz',
        },
      ],
      progressPercentage: {
        type: Number,
        default: 0,
      },
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    pricePaid: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour éviter les doublons
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

