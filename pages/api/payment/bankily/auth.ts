import type { NextApiRequest, NextApiResponse } from 'next';

interface BankilyAuthResponse {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  refresh_expires_in: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔐 [BANKILY AUTH] Étape 1: Début de la requête d\'authentification');
  console.log('🔐 [BANKILY AUTH] Méthode HTTP:', req.method);
  console.log('🔐 [BANKILY AUTH] Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'POST') {
    console.error('❌ [BANKILY AUTH] Étape 1: Méthode non autorisée:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🔐 [BANKILY AUTH] Étape 2: Récupération des credentials du commerçant');
    // IMPORTANT: L'authentification utilise les credentials du COMMERÇANT (fournis par Bankily)
    // Pas les credentials du client. Ces credentials doivent être stockés de manière sécurisée.
    // Pour l'instant, on les récupère depuis les variables d'environnement
    const merchantUsername = process.env.BANKILY_MERCHANT_USERNAME;
    const merchantPassword = process.env.BANKILY_MERCHANT_PASSWORD;

    if (!merchantUsername || !merchantPassword) {
      console.error('❌ [BANKILY AUTH] Étape 2: Credentials manquants');
      console.error('❌ [BANKILY AUTH] merchantUsername:', merchantUsername ? '✓ Configuré' : '✗ Manquant');
      console.error('❌ [BANKILY AUTH] merchantPassword:', merchantPassword ? '✓ Configuré' : '✗ Manquant');
      return res.status(500).json({ 
        message: 'Configuration Bankily manquante. Veuillez configurer BANKILY_MERCHANT_USERNAME et BANKILY_MERCHANT_PASSWORD dans les variables d\'environnement.' 
      });
    }

    console.log('✅ [BANKILY AUTH] Étape 2: Credentials récupérés avec succès');
    console.log('✅ [BANKILY AUTH] merchantUsername:', merchantUsername);

    console.log('🔐 [BANKILY AUTH] Étape 3: Préparation des paramètres de requête');
    // Préparer les données au format application/x-www-form-urlencoded
    // Selon la documentation B-PAY v1.0
    // L'authentification utilise les credentials du COMMERÇANT
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', merchantUsername);
    params.append('password', merchantPassword);
    params.append('client_id', 'ebankily');

    const bodyString = params.toString();
    console.log('✅ [BANKILY AUTH] Étape 3: Paramètres préparés');
    console.log('✅ [BANKILY AUTH] grant_type: password');
    console.log('✅ [BANKILY AUTH] username:', merchantUsername);
    console.log('✅ [BANKILY AUTH] client_id: ebankily');
    console.log('✅ [BANKILY AUTH] Body string:', bodyString.replace(/password=[^&]*/, 'password=***'));

    console.log('🔐 [BANKILY AUTH] Étape 4: Préparation de la requête HTTP');
    const requestUrl = 'https://ebankily-tst.appspot.com/authentification';
    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    console.log('✅ [BANKILY AUTH] Étape 4: URL:', requestUrl);
    console.log('✅ [BANKILY AUTH] Étape 4: Headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('✅ [BANKILY AUTH] Étape 4: Method: POST');

    console.log('🔐 [BANKILY AUTH] Étape 5: Envoi de la requête à Bankily');
    const startTime = Date.now();
    
    // Appel à l'API Bankily pour l'authentification
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: bodyString,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log('✅ [BANKILY AUTH] Étape 5: Réponse reçue en', duration, 'ms');
    console.log('✅ [BANKILY AUTH] Étape 5: Status:', response.status);
    console.log('✅ [BANKILY AUTH] Étape 5: Status Text:', response.statusText);
    console.log('✅ [BANKILY AUTH] Étape 5: Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    console.log('🔐 [BANKILY AUTH] Étape 6: Lecture du corps de la réponse');
    const responseText = await response.text();
    console.log('✅ [BANKILY AUTH] Étape 6: Taille de la réponse:', responseText.length, 'caractères');
    console.log('✅ [BANKILY AUTH] Étape 6: Contenu brut:', responseText);
    
    if (!response.ok) {
      console.error('❌ [BANKILY AUTH] Étape 6: Erreur HTTP - Status:', response.status);
      console.error('❌ [BANKILY AUTH] Étape 6: Réponse d\'erreur:', responseText);
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.error('❌ [BANKILY AUTH] Étape 6: Erreur parsée:', JSON.stringify(errorData, null, 2));
      } catch {
        errorData = { message: responseText };
        console.error('❌ [BANKILY AUTH] Étape 6: Impossible de parser l\'erreur comme JSON');
      }
      return res.status(response.status).json({ 
        message: 'Erreur d\'authentification Bankily',
        error: errorData 
      });
    }

    console.log('🔐 [BANKILY AUTH] Étape 7: Parsing de la réponse JSON');
    let data: BankilyAuthResponse;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [BANKILY AUTH] Étape 7: JSON parsé avec succès');
      console.log('✅ [BANKILY AUTH] Étape 7: access_token:', data.access_token ? '✓ Présent (' + data.access_token.substring(0, 20) + '...)' : '✗ Manquant');
      console.log('✅ [BANKILY AUTH] Étape 7: expires_in:', data.expires_in);
      console.log('✅ [BANKILY AUTH] Étape 7: refresh_token:', data.refresh_token ? '✓ Présent' : '✗ Manquant');
      console.log('✅ [BANKILY AUTH] Étape 7: refresh_expires_in:', data.refresh_expires_in);
    } catch (parseError) {
      console.error('❌ [BANKILY AUTH] Étape 7: Erreur lors du parsing JSON');
      console.error('❌ [BANKILY AUTH] Étape 7: Erreur:', parseError);
      console.error('❌ [BANKILY AUTH] Étape 7: Réponse brute:', responseText);
      return res.status(500).json({ 
        message: 'Erreur lors du parsing de la réponse',
        error: responseText 
      });
    }

    console.log('✅ [BANKILY AUTH] Étape 8: Authentification réussie - Envoi de la réponse');
    console.log('✅ [BANKILY AUTH] Résumé: Token obtenu avec succès, expires_in:', data.expires_in, 'secondes');
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('❌ [BANKILY AUTH] ERREUR GLOBALE:', error);
    console.error('❌ [BANKILY AUTH] Type d\'erreur:', error.constructor.name);
    console.error('❌ [BANKILY AUTH] Message:', error.message);
    console.error('❌ [BANKILY AUTH] Stack:', error.stack);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'authentification',
      error: error.message 
    });
  }
}

