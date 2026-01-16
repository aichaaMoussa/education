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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // IMPORTANT: L'authentification utilise les credentials du COMMERÇANT (fournis par Bankily)
    // Pas les credentials du client. Ces credentials doivent être stockés de manière sécurisée.
    // Pour l'instant, on les récupère depuis les variables d'environnement
    const merchantUsername = process.env.BANKILY_MERCHANT_USERNAME;
    const merchantPassword = process.env.BANKILY_MERCHANT_PASSWORD;

    if (!merchantUsername || !merchantPassword) {
      console.error('Bankily merchant credentials not configured');
      return res.status(500).json({ 
        message: 'Configuration Bankily manquante. Veuillez configurer BANKILY_MERCHANT_USERNAME et BANKILY_MERCHANT_PASSWORD dans les variables d\'environnement.' 
      });
    }

    // Préparer les données au format application/x-www-form-urlencoded
    // Selon la documentation B-PAY v1.0
    // L'authentification utilise les credentials du COMMERÇANT
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', merchantUsername);
    params.append('password', merchantPassword);
    params.append('client_id', 'ebankily');

    const bodyString = params.toString();
    console.log('Bankily auth request:', {
      url: 'https://ebankily-tst.appspot.com/authentification',
      body: bodyString,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // Appel à l'API Bankily pour l'authentification
    const response = await fetch('https://ebankily-tst.appspot.com/authentification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyString,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Bankily auth error:', responseText);
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return res.status(response.status).json({ 
        message: 'Erreur d\'authentification Bankily',
        error: errorData 
      });
    }

    let data: BankilyAuthResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return res.status(500).json({ 
        message: 'Erreur lors du parsing de la réponse',
        error: responseText 
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Bankily authentication error:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'authentification',
      error: error.message 
    });
  }
}

