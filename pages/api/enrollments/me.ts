import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { resolveStudentObjectIdFromSession } from '@/lib/resolveStudentObjectId';
import '@/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(200).json({ courseIds: [] as string[] });
    }

    await connectDB();
    const studentId = await resolveStudentObjectIdFromSession(session);
    if (!studentId) {
      return res.status(200).json({ courseIds: [] as string[] });
    }

    const rows = await Enrollment.find({ student: studentId })
      .select('course')
      .lean();

    const courseIds = rows.map((r) => String(r.course));
    return res.status(200).json({ courseIds });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur';
    console.error('GET /api/enrollments/me:', error);
    return res.status(500).json({ message, courseIds: [] });
  }
}
