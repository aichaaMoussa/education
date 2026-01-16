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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { clientPhone, passcode, operationId, amount, language, accessToken } = req.body;

    if (!clientPhone || !passcode || !operationId || !amount || !accessToken) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis (clientPhone, passcode, operationId, amount, accessToken)' 
      });
    }

    // Appel à l'API Bankily pour le paiement
    const paymentData: BankilyPaymentRequest = {
      clientPhone,
      passcode,
      operationId,
      amount,
      language: language || 'FR',
    };
console.log('paymentData', paymentData);
    const response = await fetch('https://ebankily-tst.appspot.com/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentData),
    });
console.log( ' response', response);
    const responseText = await response.text();
    let data: BankilyPaymentResponse;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing payment response:', parseError);
      return res.status(500).json({
        message: 'Erreur lors du parsing de la réponse',
        error: responseText,
      });
    }
     console.log('data',data);
    // Vérifier le code d'erreur selon la documentation
    // 0 = success, 2 = invalid token, 4 = Operation ID required, 1 = other error
    if (!response.ok || data.errorCode !== '0') {
      return res.status(response.status || 400).json({
        message: data.errorMessage || 'Erreur lors du paiement',
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      });
    }

    return res.status(200).json({
      success: true,
      transactionId: data.transactionId,
      message: 'Paiement effectué avec succès',
    });
  } catch (error: any) {
    console.error('Bankily payment error:', error);
    return res.status(500).json({ 
      message: 'Erreur lors du paiement',
      error: error.message 
    });
  }
}

