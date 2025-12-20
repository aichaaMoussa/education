import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/authOptions';
import { createClient } from '@supabase/supabase-js';

// Désactiver le body parser pour gérer les fichiers
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

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

    // Initialiser Supabase avec la clé de service (bypass RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        message: 'Configuration Supabase manquante. Vérifiez SUPABASE_SERVICE_ROLE_KEY dans .env.local'
      });
    }

    // Valider que la clé n'est pas un placeholder et qu'elle a la bonne longueur (JWT fait ~400+ caractères)
    if (supabaseServiceKey === 'your-service-role-key-here' || supabaseServiceKey.length < 100) {
      return res.status(500).json({ 
        message: 'SUPABASE_SERVICE_ROLE_KEY invalide. Veuillez copier la vraie service_role key depuis Supabase Settings → API. La clé doit faire plus de 100 caractères et commencer par "eyJ".'
      });
    }

    // Créer le client Supabase avec la service role key (bypass RLS automatiquement)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Récupérer le fichier depuis le body
    const { file, fileName, fileType } = req.body;

    if (!file || !fileName || !fileType) {
      return res.status(400).json({ 
        message: 'Fichier, fileName et fileType sont requis' 
      });
    }

    if (fileType !== 'pdf' && fileType !== 'video') {
      return res.status(400).json({ 
        message: 'Type de fichier invalide. Utilisez "pdf" ou "video"' 
      });
    }

    // Convertir la chaîne base64 en Buffer
    const fileBuffer = Buffer.from(file, 'base64');
    const filePath = `${fileType}s/${Date.now()}_${fileName}`;

    // Déterminer le content type
    let contentType = 'application/octet-stream';
    if (fileType === 'pdf') {
      contentType = 'application/pdf';
    } else if (fileType === 'video') {
      // Essayer de détecter le type de vidéo depuis le nom du fichier
      if (fileName.toLowerCase().endsWith('.mp4')) contentType = 'video/mp4';
      else if (fileName.toLowerCase().endsWith('.mov')) contentType = 'video/quicktime';
      else if (fileName.toLowerCase().endsWith('.avi')) contentType = 'video/x-msvideo';
      else contentType = 'video/mp4';
    }

    // Upload vers Supabase Storage avec la clé de service (bypass RLS)
    const { data, error } = await supabase.storage
      .from('education')
      .upload(filePath, fileBuffer, {
        contentType: contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ 
        message: 'Erreur lors de l\'upload du fichier',
        error: error.message 
      });
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('education')
      .getPublicUrl(filePath);

    return res.status(200).json({
      url: urlData.publicUrl,
      fileName: fileName,
      filePath: filePath,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message 
    });
  }
}
