import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
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
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Identifiant requis' });
    }

    await connectDB();

    const session = await getServerSession(req, res, authOptions);
    const studentId = await resolveStudentObjectIdFromSession(session);

    const base = await Course.findOne({
      _id: id,
      isApproved: true,
      isPublished: true,
    })
      .populate('instructor', 'firstName lastName email')
      .lean();

    if (!base || Array.isArray(base)) {
      return res.status(404).json({ message: 'Formation introuvable' });
    }

    const courseBase = base;

    const isEnrolled =
      !!studentId &&
      !!(await Enrollment.exists({
        student: studentId,
        course: courseBase._id,
      }));

    if (!isEnrolled) {
      const lessonsArr = courseBase.lessons as unknown;
      const lessonCount = Array.isArray(lessonsArr) ? lessonsArr.length : 0;
      const pdfCount = courseBase.resources?.pdfs?.length ?? 0;
      const videoCount = courseBase.resources?.videos?.length ?? 0;
      const quizCount = courseBase.resources?.quizzes?.length ?? 0;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- masquer leçons / URLs
      const { resources: _res, lessons: _les, ...rest } = courseBase as Record<
        string,
        unknown
      >;

      return res.status(200).json({
        ...rest,
        isEnrolled: false,
        lessonCount,
        resourcesPreview: { pdfCount, videoCount, quizCount },
        resources: { pdfs: [], videos: [], quizzes: [] },
        lessons: [],
      });
    }

    const full = await Course.findById(id)
      .populate('instructor', 'firstName lastName email')
      .populate(
        'lessons',
        'title description videoUrl duration order isFree'
      )
      .populate({ path: 'resources.quizzes', select: 'title' })
      .lean();

    if (!full || Array.isArray(full)) {
      return res.status(404).json({ message: 'Formation introuvable' });
    }

    return res.status(200).json({
      ...full,
      isEnrolled: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur';
    console.error('GET /api/courses/[id]:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération de la formation',
      error: message,
    });
  }
}
