/**
 * Normalise une URL pour forcer HTTPS si nécessaire
 * Remplace http:// par https:// pour éviter le contenu mixte
 */
export function normalizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // Si c'est déjà une URL complète
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Forcer HTTPS
    return url.replace(/^http:\/\//, 'https://');
  }
  
  // Si c'est un chemin relatif, le retourner tel quel
  return url;
}

/**
 * Normalise une URL de média pour utiliser HTTPS
 */
export function normalizeMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  const normalized = normalizeUrl(url);
  
  // Si l'URL commence par le domaine, s'assurer qu'elle est en HTTPS
  if (normalized.includes('itkane.net') || normalized.includes('localhost')) {
    return normalized.replace(/^http:\/\//, 'https://');
  }
  
  return normalized;
}

