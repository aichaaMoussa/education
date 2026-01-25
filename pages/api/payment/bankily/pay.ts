import type { NextApiRequest, NextApiResponse } from 'next';

interface BankilyPaymentRequest {
  clientPhone: string;
  passcode: string;
  operationId: string;
  amount: string;
  language?: string;
}

interface BankilyPaymentResponse {
  errorCode: string;
  errorMessage: string;
  transactionId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('💳 [BANKILY PAY] Étape 1: Début de la requête de paiement');
  console.log('💳 [BANKILY PAY] Méthode HTTP:', req.method);
  console.log('💳 [BANKILY PAY] Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'POST') {
    console.error('❌ [BANKILY PAY] Étape 1: Méthode non autorisée:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('💳 [BANKILY PAY] Étape 2: Extraction des données de la requête');
    const { clientPhone, passcode, operationId, amount, language, accessToken } = req.body;
    
    console.log('💳 [BANKILY PAY] Étape 2: Données reçues');
    console.log('💳 [BANKILY PAY] clientPhone:', clientPhone ? '✓ ' + clientPhone : '✗ Manquant');
    console.log('💳 [BANKILY PAY] passcode:', passcode ? '✓ ' + '***' : '✗ Manquant');
    console.log('💳 [BANKILY PAY] operationId:', operationId ? '✓ ' + operationId : '✗ Manquant');
    console.log('💳 [BANKILY PAY] amount:', amount ? '✓ ' + amount : '✗ Manquant');
    console.log('💳 [BANKILY PAY] language:', language || 'FR (défaut)');
    console.log('💳 [BANKILY PAY] accessToken:', accessToken ? '✓ Présent (' + accessToken.substring(0, 20) + '...)' : '✗ Manquant');

    console.log('💳 [BANKILY PAY] Étape 3: Validation des champs requis');
    if (!clientPhone || !passcode || !operationId || !amount || !accessToken) {
      console.error('❌ [BANKILY PAY] Étape 3: Champs manquants');
      const missingFields = [];
      if (!clientPhone) missingFields.push('clientPhone');
      if (!passcode) missingFields.push('passcode');
      if (!operationId) missingFields.push('operationId');
      if (!amount) missingFields.push('amount');
      if (!accessToken) missingFields.push('accessToken');
      console.error('❌ [BANKILY PAY] Champs manquants:', missingFields.join(', '));
      return res.status(400).json({ 
        message: 'Tous les champs sont requis (clientPhone, passcode, operationId, amount, accessToken)' 
      });
    }
    console.log('✅ [BANKILY PAY] Étape 3: Tous les champs sont présents');

    console.log('💳 [BANKILY PAY] Étape 4: Préparation des données de paiement');
    // Appel à l'API Bankily pour le paiement
    const paymentData: BankilyPaymentRequest = {
      clientPhone,
      passcode,
      operationId,
      amount,
      language: language || 'FR',
    };
    console.log('✅ [BANKILY PAY] Étape 4: Données de paiement préparées');
    console.log('✅ [BANKILY PAY] paymentData:', {
      ...paymentData,
      passcode: '***' // Masquer le passcode dans les logs
    });

    console.log('💳 [BANKILY PAY] Étape 5: Préparation de la requête HTTP');
    const requestUrl = 'https://ebankily-tst.appspot.com/payment';
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
    const requestBody = JSON.stringify(paymentData);
    console.log('✅ [BANKILY PAY] Étape 5: URL:', requestUrl);
    console.log('✅ [BANKILY PAY] Étape 5: Headers:', JSON.stringify({
      'Content-Type': requestHeaders['Content-Type'],
      'Authorization': 'Bearer ***'
    }, null, 2));
    console.log('✅ [BANKILY PAY] Étape 5: Method: POST');
    console.log('✅ [BANKILY PAY] Étape 5: Body size:', requestBody.length, 'caractères');

    console.log('💳 [BANKILY PAY] Étape 6: Envoi de la requête à Bankily');
    const startTime = Date.now();
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log('✅ [BANKILY PAY] Étape 6: Réponse reçue en', duration, 'ms');
    console.log('✅ [BANKILY PAY] Étape 6: Status:', response.status);
    console.log('✅ [BANKILY PAY] Étape 6: Status Text:', response.statusText);
    console.log('✅ [BANKILY PAY] Étape 6: Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    console.log('💳 [BANKILY PAY] Étape 7: Lecture du corps de la réponse');
    const responseText = await response.text();
    console.log('✅ [BANKILY PAY] Étape 7: Taille de la réponse:', responseText.length, 'caractères');
    console.log('✅ [BANKILY PAY] Étape 7: Contenu brut:', responseText);

    console.log('💳 [BANKILY PAY] Étape 8: Parsing de la réponse JSON');
    let data: BankilyPaymentResponse;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [BANKILY PAY] Étape 8: JSON parsé avec succès');
      console.log('✅ [BANKILY PAY] Étape 8: errorCode:', data.errorCode);
      console.log('✅ [BANKILY PAY] Étape 8: errorMessage:', data.errorMessage);
      console.log('✅ [BANKILY PAY] Étape 8: transactionId:', data.transactionId || 'Non fourni');
    } catch (parseError) {
      console.error('❌ [BANKILY PAY] Étape 8: Erreur lors du parsing JSON');
      console.error('❌ [BANKILY PAY] Étape 8: Erreur:', parseError);
      console.error('❌ [BANKILY PAY] Étape 8: Réponse brute:', responseText);
      return res.status(500).json({
        message: 'Erreur lors du parsing de la réponse',
        error: responseText,
      });
    }

    console.log('💳 [BANKILY PAY] Étape 9: Vérification du code d\'erreur');
    // Vérifier le code d'erreur selon la documentation
    // 0 = success, 2 = invalid token, 4 = Operation ID required, 1 = other error
    console.log('💳 [BANKILY PAY] Codes d\'erreur possibles:');
    console.log('💳 [BANKILY PAY] - 0 = success');
    console.log('💳 [BANKILY PAY] - 2 = invalid token');
    console.log('💳 [BANKILY PAY] - 4 = Operation ID required');
    console.log('💳 [BANKILY PAY] - 1 = other error');
    console.log('💳 [BANKILY PAY] Code reçu:', data.errorCode);
    
    if (!response.ok || data.errorCode !== '0') {
      console.error('❌ [BANKILY PAY] Étape 9: Paiement échoué');
      console.error('❌ [BANKILY PAY] HTTP Status:', response.status);
      console.error('❌ [BANKILY PAY] Error Code:', data.errorCode);
      console.error('❌ [BANKILY PAY] Error Message:', data.errorMessage);
      return res.status(response.status || 400).json({
        message: data.errorMessage || 'Erreur lors du paiement',
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      });
    }

    console.log('✅ [BANKILY PAY] Étape 9: Paiement réussi');
    console.log('✅ [BANKILY PAY] Étape 10: Préparation de la réponse de succès');
    console.log('✅ [BANKILY PAY] transactionId:', data.transactionId);
    console.log('✅ [BANKILY PAY] Résumé: Paiement effectué avec succès');
    
    return res.status(200).json({
      success: true,
      transactionId: data.transactionId,
      message: 'Paiement effectué avec succès',
    });
  } catch (error: any) {
    console.error('❌ [BANKILY PAY] ERREUR GLOBALE:', error);
    console.error('❌ [BANKILY PAY] Type d\'erreur:', error.constructor.name);
    console.error('❌ [BANKILY PAY] Message:', error.message);
    console.error('❌ [BANKILY PAY] Stack:', error.stack);
    return res.status(500).json({ 
      message: 'Erreur lors du paiement',
      error: error.message 
    });
  }
}

