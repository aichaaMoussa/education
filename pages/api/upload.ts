import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/authOptions';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Désactiver le body parser par défaut pour gérer les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

// Import dynamique de Firebase Admin pour éviter les erreurs si non configuré
async function getFirebaseAdmin() {
  try {
    const admin = await import('firebase-admin');
    const { getApps, initializeApp, cert } = admin.default;
    
    if (!getApps().length) {
      // Vérifier si on a un service account key
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccount) {
        try {
          const serviceAccountKey = JSON.parse(serviceAccount);
          initializeApp({
            credential: cert(serviceAccountKey),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          });
        } catch (e) {
          // Si pas de service account, utiliser les variables d'environnement
          initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          });
        }
      } else {
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      }
    }
    
    return admin.default;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Parser le formulaire
    const form = formidable({
      maxFileSize: 500 * 1024 * 1024, // 500MB
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), 'tmp'),
    });

    // Créer le dossier tmp s'il n'existe pas
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileType = Array.isArray(fields.type) ? fields.type[0] : fields.type;

    if (!file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    if (!fileType || (fileType !== 'pdf' && fileType !== 'video')) {
      return res.status(400).json({ message: 'Type de fichier invalide. Utilisez "pdf" ou "video"' });
    }

    // Lire le fichier
    const fileData = fs.readFileSync(file.filepath);
    const fileName = `${fileType}s/${Date.now()}_${file.originalFilename || 'file'}`;
    
    // Upload vers Firebase Storage avec Admin SDK
    try {
      const admin = await getFirebaseAdmin();
      const { getStorage } = await import('firebase-admin/storage');
      const bucket = getStorage().bucket();
      const fileRef = bucket.file(fileName);
      
      await fileRef.save(fileData, {
        metadata: {
          contentType: file.mimetype || (fileType === 'pdf' ? 'application/pdf' : 'video/mp4'),
        },
      });

      // Obtenir l'URL de téléchargement
      await fileRef.makePublic();
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Supprimer le fichier temporaire
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        // Ignorer les erreurs de suppression
      }

      return res.status(200).json({
        url: downloadURL,
        fileName: file.originalFilename,
        size: file.size,
      });
    } catch (firebaseError: any) {
      // Si Firebase Admin échoue, essayer une approche alternative
      console.error('Firebase Admin upload error:', firebaseError);
      
      // Supprimer le fichier temporaire
      try {
        fs.unlinkSync(file.filepath);
      } catch (e) {
        // Ignorer les erreurs de suppression
      }
      
      throw new Error(`Erreur lors de l'upload Firebase: ${firebaseError.message || 'Erreur inconnue'}`);
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message || 'Erreur inconnue'
    });
  }
}

