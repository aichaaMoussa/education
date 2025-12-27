import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  FiBook, FiFileText, FiVideo, FiX, FiUpload, FiCheckCircle,
  FiDollarSign, FiTag, FiFile, FiImage
} from 'react-icons/fi';
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ProtectedRoute from '../../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../../lib/permissions';
import { showToast } from '../../../lib/toast';
import { useDropzone } from 'react-dropzone';
// ========== IMPORTS FIREBASE (COMMENTÉS) ==========
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { storage } from '../../../lib/firebase';

// ========== IMPORTS SUPABASE (COMMENTÉ - Upload via API serveur maintenant) ==========
// import { supabase } from '../../../lib/supabase';

interface UploadedFile {
  file: File;
  url?: string;
  uploading: boolean;
  progress: number;
  error?: string;
  id: string; // Identifiant unique pour chaque fichier
}

const COURSE_CATEGORIES = [
  'Développement Web',
  'Développement Mobile',
  'Data Science',
  'Design',
  'Marketing Digital',
  'Business',
  'Photographie',
  'Musique',
  'Langues',
  'Autre'
];

const COURSE_LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' }
];

export default function CreateCourse() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  
  // Formulaire
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  
  // Fichiers
  const [pdfFiles, setPdfFiles] = useState<UploadedFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<UploadedFile[]>([]);

  // Dropzone pour PDFs
  const onDropPdfs = useCallback((acceptedFiles: File[]) => {
    const newPdfs = acceptedFiles.map(file => ({
      file,
      uploading: false,
      progress: 0,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    setPdfFiles(prev => [...prev, ...newPdfs]);
  }, []);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onDropPdfs,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  // Dropzone pour Vidéos
  const onDropVideos = useCallback((acceptedFiles: File[]) => {
    const newVideos = acceptedFiles.map(file => ({
      file,
      uploading: false,
      progress: 0,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    setVideoFiles(prev => [...prev, ...newVideos]);
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragActive } = useDropzone({
    onDrop: onDropVideos,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // ========== FONCTION UPLOAD FIREBASE (COMMENTÉE) ==========
  // const uploadFile = async (file: File, type: 'pdf' | 'video'): Promise<string> => {
  //   const fileName = `${type}s/${Date.now()}_${file.name}`;
  //   const storageRef = ref(storage, fileName);
  //   
  //   return new Promise((resolve, reject) => {
  //     const uploadTask = uploadBytesResumable(storageRef, file);
  //     
  //     uploadTask.on(
  //       'state_changed',
  //       (snapshot) => {
  //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //         // Mettre à jour la progression si nécessaire
  //       },
  //       (error) => {
  //         reject(error);
  //       },
  //       async () => {
  //         try {
  //           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
  //           resolve(downloadURL);
  //         } catch (error) {
  //           reject(error);
  //         }
  //       }
  //     );
  //   });
  // };

  // ========== FONCTION UPLOAD SUPABASE ==========
  // Upload via API serveur pour bypasser RLS avec la service role key
  const uploadFile = async (
    file: File, 
    type: 'pdf' | 'video',
    fileId: string,
    setProgress: (id: string, progress: number) => void,
    setError: (id: string, error: string) => void
  ): Promise<string> => {
    try {
      setProgress(fileId, 10); // 10% - Début de la conversion
      
      // Convertir le fichier en base64 pour l'envoi via API (méthode optimisée pour gros fichiers)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      setProgress(fileId, 30); // 30% - Conversion en cours
      
      // Convertir par chunks pour éviter "Maximum call stack size exceeded"
      let binaryString = '';
      const chunkSize = 8192; // Traiter par chunks de 8KB
      const totalChunks = Math.ceil(uint8Array.length / chunkSize);
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        // Convertir chunk par chunk sans utiliser spread operator
        for (let j = 0; j < chunk.length; j++) {
          binaryString += String.fromCharCode(chunk[j]);
        }
        // Mise à jour de la progression pendant la conversion
        const chunkProgress = 30 + Math.floor((i / uint8Array.length) * 20);
        setProgress(fileId, chunkProgress);
      }
      
      const base64 = btoa(binaryString);
      setProgress(fileId, 50); // 50% - Conversion terminée, début de l'envoi

      // Envoyer le fichier à l'API serveur
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          fileType: type,
        }),
      });

      setProgress(fileId, 90); // 90% - Réponse reçue

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      setProgress(fileId, 100); // 100% - Terminé
      return data.url;
    } catch (error: any) {
      console.error('Error uploading to Supabase:', error);
      const errorMessage = error.message || 'Erreur lors de l\'upload';
      setError(fileId, errorMessage);
      throw error;
    }
  };

  // Fonction pour mettre à jour la progression d'un fichier
  const updatePdfProgress = useCallback((id: string, progress: number) => {
    setPdfFiles(prev => prev.map(f => f.id === id ? { ...f, progress, uploading: progress < 100 } : f));
  }, []);

  const updateVideoProgress = useCallback((id: string, progress: number) => {
    setVideoFiles(prev => prev.map(f => f.id === id ? { ...f, progress, uploading: progress < 100 } : f));
  }, []);

  // Fonction pour définir une erreur sur un fichier
  const setPdfError = useCallback((id: string, error: string) => {
    setPdfFiles(prev => prev.map(f => f.id === id ? { ...f, error, uploading: false } : f));
  }, []);

  const setVideoError = useCallback((id: string, error: string) => {
    setVideoFiles(prev => prev.map(f => f.id === id ? { ...f, error, uploading: false } : f));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !price || !description) {
      showToast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (pdfFiles.length === 0 && videoFiles.length === 0) {
      showToast.error('Veuillez ajouter au moins un fichier PDF ou une vidéo');
      return;
    }

    setLoading(true);
    const loadingToast = showToast.loading('Upload des fichiers en cours...');

    try {
      // ========== UPLOAD PARALLÈLE DES FICHIERS ==========
      // Upload des fichiers vers Supabase Storage en parallèle pour plus de rapidité
      const uploadedPdfs: string[] = [];
      const uploadedVideos: string[] = [];
      const uploadErrors: string[] = [];

      // Marquer tous les fichiers comme en cours d'upload
      setPdfFiles(prev => prev.map(f => ({ ...f, uploading: true, progress: 0, error: undefined })));
      setVideoFiles(prev => prev.map(f => ({ ...f, uploading: true, progress: 0, error: undefined })));

      // Créer toutes les promesses d'upload en parallèle
      const pdfUploadPromises = pdfFiles.map(async (pdfFile) => {
        try {
          const url = await uploadFile(
            pdfFile.file, 
            'pdf', 
            pdfFile.id,
            updatePdfProgress,
            setPdfError
          );
          uploadedPdfs.push(url);
          return { success: true, fileName: pdfFile.file.name };
        } catch (error: any) {
          const errorMsg = `Erreur lors de l'upload de ${pdfFile.file.name}: ${error.message}`;
          uploadErrors.push(errorMsg);
          return { success: false, fileName: pdfFile.file.name, error: errorMsg };
        }
      });

      const videoUploadPromises = videoFiles.map(async (videoFile) => {
        try {
          const url = await uploadFile(
            videoFile.file, 
            'video', 
            videoFile.id,
            updateVideoProgress,
            setVideoError
          );
          uploadedVideos.push(url);
          return { success: true, fileName: videoFile.file.name };
        } catch (error: any) {
          const errorMsg = `Erreur lors de l'upload de ${videoFile.file.name}: ${error.message}`;
          uploadErrors.push(errorMsg);
          return { success: false, fileName: videoFile.file.name, error: errorMsg };
        }
      });

      // Attendre que tous les uploads se terminent (en parallèle)
      const allUploadResults = await Promise.allSettled([
        ...pdfUploadPromises,
        ...videoUploadPromises
      ]);

      // Vérifier s'il y a eu des erreurs critiques
      const failedUploads = allUploadResults.filter(result => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      if (failedUploads.length > 0 && uploadedPdfs.length === 0 && uploadedVideos.length === 0) {
        // Tous les uploads ont échoué
        throw new Error('Tous les fichiers ont échoué lors de l\'upload. Veuillez réessayer.');
      }

      if (failedUploads.length > 0) {
        // Certains fichiers ont échoué mais d'autres ont réussi
        showToast.error(`${failedUploads.length} fichier(s) n'ont pas pu être uploadés. Le cours sera créé avec les fichiers disponibles.`);
      }

      if (uploadedPdfs.length === 0 && uploadedVideos.length === 0) {
        throw new Error('Aucun fichier n\'a pu être uploadé. Veuillez réessayer.');
      }

      // Créer le cours
      const courseData = {
        title,
        category,
        price: parseFloat(price),
        description,
        level,
        resources: {
          pdfs: uploadedPdfs,
          videos: uploadedVideos,
          quizzes: []
        }
      };

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        showToast.success('Cours créé avec succès !');
        // Rediriger selon le rôle : formateurs vers leurs formations, admins vers la validation
        const userRole = session?.user?.role?.name;
        if (userRole === 'admin') {
          router.push('/admin/courses/approve');
        } else {
          router.push('/formateur/courses');
        }
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de la création du cours');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      showToast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user;
  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiBook className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Créer un Cours', href: '/admin/courses/create', icon: <FiBook className="w-5 h-5" />, permission: PERMISSIONS.COURSE_CREATE },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.COURSE_CREATE}>
      <Head>
        <title>Créer un Cours - Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header 
          user={user ? {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: { name: user.role?.name || '' }
          } : undefined} 
          onLogout={async () => {
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            router.push('/login');
          }} 
        />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={(user?.role?.permissions || []) as any} />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                  <FiBook className="text-blue-600" />
                  <span>Créer un Nouveau Cours</span>
                </h1>
                <p className="text-gray-600 mt-1">Remplissez les informations ci-dessous pour créer votre cours</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiTag className="text-blue-600" />
                    <span>Informations de base</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <Input
                      label="Nom du cours *"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Introduction à React"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {COURSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Niveau *
                        </label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {COURSE_LEVELS.map(lvl => (
                            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Prix (MRU) *"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Décrivez votre cours en détail..."
                        required
                      />
                    </div>
                  </div>
                </Card>

                {/* Fichiers PDF */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiFileText className="text-blue-600" />
                    <span>Fichiers PDF</span>
                  </h2>

                  <div
                    {...getPdfRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isPdfDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                    `}
                  >
                    <input {...getPdfInputProps()} />
                    <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {isPdfDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez des PDFs ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-sm text-gray-500">PDF uniquement (max 50MB par fichier)</p>
                  </div>

                  {pdfFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {pdfFiles.map((pdf, index) => (
                        <div key={pdf.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FiFileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{pdf.file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(pdf.file.size)}</p>
                              </div>
                            </div>
                            {!pdf.uploading && !pdf.error && (
                              <button
                                type="button"
                                onClick={() => removePdf(index)}
                                className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2 p-1 hover:bg-red-50 rounded"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          
                          {/* Barre de progression */}
                          {pdf.uploading && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Upload en cours...</span>
                                <span>{pdf.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${pdf.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Erreur */}
                          {pdf.error && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              {pdf.error}
                              <button
                                type="button"
                                onClick={() => removePdf(index)}
                                className="ml-2 text-red-600 hover:text-red-800 underline"
                              >
                                Retirer
                              </button>
                            </div>
                          )}

                          {/* Succès */}
                          {!pdf.uploading && !pdf.error && pdf.url && (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                              <FiCheckCircle className="w-4 h-4 mr-1" />
                              <span>Upload réussi</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Vidéos */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FiVideo className="text-blue-600" />
                    <span>Vidéos</span>
                  </h2>

                  <div
                    {...getVideoRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isVideoDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                    `}
                  >
                    <input {...getVideoInputProps()} />
                    <FiVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      {isVideoDragActive ? 'Déposez les vidéos ici' : 'Glissez-déposez des vidéos ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-sm text-gray-500">MP4, MOV, AVI, MKV (max 500MB par fichier)</p>
                  </div>

                  {videoFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {videoFiles.map((video, index) => (
                        <div key={video.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FiVideo className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{video.file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(video.file.size)}</p>
                              </div>
                            </div>
                            {!video.uploading && !video.error && (
                              <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2 p-1 hover:bg-red-50 rounded"
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          
                          {/* Barre de progression */}
                          {video.uploading && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Upload en cours...</span>
                                <span>{video.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${video.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Erreur */}
                          {video.error && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              {video.error}
                              <button
                                type="button"
                                onClick={() => removeVideo(index)}
                                className="ml-2 text-red-600 hover:text-red-800 underline"
                              >
                                Retirer
                              </button>
                            </div>
                          )}

                          {/* Succès */}
                          {!video.uploading && !video.error && video.url && (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                              <FiCheckCircle className="w-4 h-4 mr-1" />
                              <span>Upload réussi</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="min-w-[150px]"
                  >
                    <FiCheckCircle className="w-5 h-5 mr-2" />
                    Créer le Cours
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

