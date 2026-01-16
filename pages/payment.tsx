import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { normalizeMediaUrl } from '../lib/utils/url';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiCreditCard, FiLock, FiCheckCircle, FiArrowLeft, 
  FiDollarSign, FiShield, FiCheck
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProtectedRoute from '../components/protected/ProtectedRoute';
import { showToast } from '../lib/toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail?: string;
  instructor: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'wallet',
    name: 'Wallet',
    iconComponent: FiDollarSign,
    description: 'Payer avec votre portefeuille électronique',
  },
  {
    id: 'bankily',
    name: 'Bankily',
    iconComponent: FiCreditCard,
    description: 'Payer avec Bankily',
  },
  {
    id: 'masrvi',
    name: 'Masrvi',
    iconComponent: FiCreditCard,
    description: 'Payer avec Masrvi',
  },
  {
    id: 'sedaat',
    name: 'Sedaat',
    iconComponent: FiCreditCard,
    description: 'Payer avec Sedaat',
  },
];

function PaymentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { courseId } = router.query;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // États pour Bankily
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  
  const MERCHANT_CODE = '3456';

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    } else {
      router.push('/');
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses`);
      if (response.ok) {
        const courses = await response.json();
        const foundCourse = courses.find((c: Course) => c._id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Authentification Bankily (utilise les credentials du commerçant, pas du client)
  const handleBankilyAuth = async () => {
    setAuthenticating(true);
    try {
      // L'authentification se fait avec les credentials du COMMERÇANT (stockés côté serveur)
      // Pas besoin de passer username/password depuis le client
      const response = await fetch('/api/payment/bankily/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Pas besoin de credentials côté client
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Erreur d\'authentification');
        setAuthenticating(false);
        return;
      }

      setAccessToken(data.access_token);
      showToast.success('Authentification réussie');
    } catch (error: any) {
      console.error('Auth error:', error);
      showToast.error('Erreur lors de l\'authentification');
    } finally {
      setAuthenticating(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !course) return;

    // Si Bankily est sélectionné, vérifier l'authentification
    if (selectedPaymentMethod === 'bankily') {
      if (!phoneNumber || !passcode) {
        showToast.error('Veuillez remplir le numéro de téléphone et le passcode');
        return;
      }

      setProcessing(true);
      
      try {
        // Si pas de token, authentifier d'abord avec les credentials du COMMERÇANT
        let token = accessToken;
        if (!token) {
          // L'authentification utilise les credentials du COMMERÇANT (stockés côté serveur)
          const authResponse = await fetch('/api/payment/bankily/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Pas besoin de credentials côté client
          });

          const authData = await authResponse.json();

          if (!authResponse.ok) {
            showToast.error(authData.message || 'Erreur d\'authentification');
            setProcessing(false);
            return;
          }

          token = authData.access_token;
          setAccessToken(token);
        }

        // Effectuer le paiement
        const operationId = `OP-${course._id}-${Date.now()}`;
        
        const response = await fetch('/api/payment/bankily/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientPhone: phoneNumber,
            passcode: passcode,
            operationId: operationId,
            amount: course.price.toString(),
            language: 'FR',
            accessToken: token,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          showToast.error(data.message || 'Erreur lors du paiement');
          setProcessing(false);
          return;
        }

        showToast.success('Paiement effectué avec succès !');
        // Rediriger vers la page de confirmation
        router.push(`/payment/success?courseId=${course._id}&transactionId=${data.transactionId}`);
      } catch (error: any) {
        console.error('Payment error:', error);
        showToast.error('Erreur lors du paiement');
        setProcessing(false);
      }
    } else {
      // Autres méthodes de paiement (à implémenter)
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        router.push(`/payment/success?courseId=${course._id}`);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Paiement - Easy Tech</title>
        <meta name="description" content="Finalisez votre achat" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2">
                  <FaGraduationCap className="text-2xl text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Easy Tech
                </span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/courses/${course._id}`}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Retour au cours</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Finalisez votre achat
                  </h1>
                  <p className="text-gray-600">
                    Choisissez votre méthode de paiement préférée
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Méthode de paiement
                  </h2>
                  {paymentMethods.map((method) => {
                    const IconComponent = method.iconComponent;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`
                          w-full p-5 rounded-xl border-2 transition-all duration-200 text-left
                          ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`
                                p-3 rounded-lg
                                ${
                                  selectedPaymentMethod === method.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }
                              `}
                            >
                              <IconComponent className="w-6 h-6" />
                            </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                    );
                  })}
                </div>

                {/* Bankily Payment Form */}
                {selectedPaymentMethod === 'bankily' && (
                  <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Paiement via Bankily B-PAY
                      </h3>
                      
                      {/* Merchant Code and Amount - Informations à utiliser dans Bankily */}
                      <div className="mb-6 p-5 bg-white rounded-xl border-2 border-blue-300 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          Informations pour Bankily
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Code commerçant</p>
                            <p className="text-2xl font-bold text-blue-600">{MERCHANT_CODE}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Montant à payer</p>
                            <p className="text-2xl font-bold text-blue-600">{course.price} MRU</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions pour utiliser Bankily */}
                      <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                        <h4 className="text-base font-semibold text-yellow-900 mb-3 flex items-center space-x-2">
                          <FiCheckCircle className="w-5 h-5" />
                          <span>Instructions de paiement</span>
                        </h4>
                        <ol className="space-y-2 text-sm text-yellow-900 list-decimal list-inside">
                          <li>Ouvrez l'application <strong>Bankily</strong> sur votre téléphone</li>
                          <li>Accédez à la fonctionnalité <strong>B-PAY</strong></li>
                          <li>Renseignez le <strong>code commerçant : {MERCHANT_CODE}</strong></li>
                          <li>Renseignez le <strong>montant : {course.price} MRU</strong></li>
                          <li>Confirmez le paiement et entrez votre <strong>code PIN Bankily</strong></li>
                          <li>Copiez le <strong>passcode de paiement</strong> affiché par Bankily</li>
                          <li>Revenez sur cette page et entrez vos informations ci-dessous</li>
                        </ol>
                      </div>

                      {/* Divider */}
                      <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500 font-medium">Informations de paiement</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      {/* Phone Number Input (Client) */}
                      <div className="mb-4">
                        <Input
                          label="Numéro de téléphone Bankily"
                          type="tel"
                          placeholder="Ex: 22212345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          disabled={processing || authenticating}
                          helperText="Votre numéro de téléphone Bankily"
                        />
                      </div>

                      {/* Passcode Input (Client) - Code généré par Bankily */}
                      <div className="mb-4">
                        <Input
                          label="Passcode de paiement"
                          type="text"
                          placeholder="Entrez le passcode reçu de Bankily"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          required
                          disabled={processing || authenticating}
                          helperText="Le passcode généré par Bankily après confirmation du paiement"
                        />
                      </div>

                      {/* Information sur le passcode */}
                      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                        <p className="text-xs text-blue-900">
                          <strong>Note :</strong> Le passcode est le code de vérification affiché par Bankily après avoir confirmé votre paiement avec votre code PIN. 
                          Ce n'est pas votre code PIN.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <FiShield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Paiement sécurisé
                    </p>
                    <p className="text-xs text-green-700">
                      Vos informations sont protégées par un chiffrement SSL
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Résumé de la commande
                </h2>

                {/* Course Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl mb-4 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={normalizeMediaUrl(course.thumbnail)}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaGraduationCap className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span>
                      {course.level === 'beginner'
                        ? 'Débutant'
                        : course.level === 'intermediate'
                        ? 'Intermédiaire'
                        : 'Avancé'}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Prix du cours</span>
                    <span className="font-semibold">{course.price} MRU</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Taxes</span>
                    <span className="font-semibold">0 MRU</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-extrabold text-blue-600">
                        {course.price} MRU
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || processing}
                  isLoading={processing}
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <FiLock className="w-5 h-5" />
                  <span>
                    {processing
                      ? 'Traitement...'
                      : `Payer ${course.price} MRU`}
                  </span>
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  En cliquant sur "Payer", vous acceptez nos conditions
                  d'utilisation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Payment() {
  return (
    <ProtectedRoute>
      <PaymentPage />
    </ProtectedRoute>
  );
}

