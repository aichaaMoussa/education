import mongoose from 'mongoose';
import type { Session } from 'next-auth';
import User from '@/models/User';

/**
 * Identifiant MongoDB de l'utilisateur connecté (apprenant), pour inscriptions / accès cours.
 */
export async function resolveStudentObjectIdFromSession(
  session: Session | null
): Promise<mongoose.Types.ObjectId | undefined> {
  if (!session?.user) return undefined;

  const uid = (session.user as { id?: string }).id;
  if (uid && mongoose.isValidObjectId(uid)) {
    return new mongoose.Types.ObjectId(uid);
  }

  const email = session.user.email;
  if (email) {
    const u = await User.findOne({ email: email.toLowerCase().trim() })
      .select('_id')
      .lean<{ _id: mongoose.Types.ObjectId } | null>();
    if (u?._id) return u._id;
  }

  return undefined;
}
