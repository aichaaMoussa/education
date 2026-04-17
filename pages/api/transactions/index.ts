import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import '@/models';

function studentDisplayName(
  session: {
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      name?: string | null;
      email?: string | null;
    };
  },
  populatedStudent: unknown
): string {
  const p = populatedStudent as
    | { firstName?: string; lastName?: string }
    | null
    | undefined;
  if (p && typeof p === 'object' && (p.firstName || p.lastName)) {
    return [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  }
  const u = session.user as {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
  };
  const fromSession = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  if (fromSession) return fromSession;
  if (u.name) return String(u.name);
  if (u.email) return String(u.email);
  return '—';
}

/** Document transaction après populate + lean (types Mongoose trop larges sinon). */
type TransactionPopulatedLean = {
  _id: mongoose.Types.ObjectId;
  paidAt: Date;
  walletType: string;
  phoneNumber: string;
  amount: number;
  providerTransactionId?: string;
  student?: { firstName?: string; lastName?: string } | null;
  course?: unknown;
};

function resolveUserObjectId(session: {
  user: { id?: string; email?: string | null };
}): mongoose.Types.ObjectId | undefined {
  const sid = session.user?.id;
  if (sid && mongoose.isValidObjectId(sid)) {
    return new mongoose.Types.ObjectId(sid);
  }
  return undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const {
      courseId,
      walletType,
      phoneNumber,
      amount,
      providerTransactionId,
    } = req.body as {
      courseId?: string;
      walletType?: string;
      phoneNumber?: string;
      amount?: number;
      providerTransactionId?: string;
    };

    if (!courseId || !walletType || !phoneNumber || amount == null) {
      return res.status(400).json({
        message:
          'Champs requis: courseId, walletType, phoneNumber, amount',
      });
    }

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    await connectDB();

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Identifiant de cours invalide' });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    let studentId = resolveUserObjectId(session);
    if (!studentId && session.user.email) {
      const dbUser = await User.findOne({
        email: String(session.user.email).toLowerCase(),
      })
        .select('_id')
        .lean<{ _id: mongoose.Types.ObjectId } | null>();
      if (dbUser?._id) {
        studentId = dbUser._id;
      }
    }

    const paidAt = new Date();

    const transaction = await Transaction.create({
      student: studentId,
      course: new mongoose.Types.ObjectId(courseId),
      walletType: String(walletType).trim(),
      phoneNumber: String(phoneNumber).trim(),
      amount,
      paidAt,
      providerTransactionId: providerTransactionId
        ? String(providerTransactionId).trim()
        : undefined,
    });

    if (studentId) {
      try {
        await Enrollment.findOneAndUpdate(
          {
            student: studentId,
            course: new mongoose.Types.ObjectId(courseId),
          },
          {
            $setOnInsert: {
              student: studentId,
              course: new mongoose.Types.ObjectId(courseId),
              pricePaid: amount,
              purchasedAt: paidAt,
              progress: {
                lessonsCompleted: [],
                quizzesCompleted: [],
                progressPercentage: 0,
              },
            },
          },
          { upsert: true, new: true }
        );
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { students: studentId },
        });
      } catch (enrollErr: any) {
        if (enrollErr?.code !== 11000) {
          console.error('Enrollment update error:', enrollErr);
        }
      }
    }

    const populatedRaw = await Transaction.findById(transaction._id)
      .populate('course', 'title category level price')
      .populate('student', 'firstName lastName')
      .lean();

    const populated = populatedRaw as TransactionPopulatedLean | null;
    if (!populated) {
      return res.status(500).json({
        message: 'Transaction introuvable après création',
      });
    }

    const studentName = studentDisplayName(session, populated.student);

    return res.status(201).json({
      transaction: {
        _id: populated._id.toString(),
        paidAt: populated.paidAt,
        walletType: populated.walletType,
        phoneNumber: populated.phoneNumber,
        amount: populated.amount,
        providerTransactionId: populated.providerTransactionId,
        studentName,
        course: populated.course,
      },
    });
  } catch (error: any) {
    console.error('POST /api/transactions:', error);
    return res.status(500).json({
      message: 'Erreur lors de l’enregistrement de la transaction',
      error: error.message,
    });
  }
}
