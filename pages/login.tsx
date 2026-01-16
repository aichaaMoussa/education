import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession, getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { showToast } from '../lib/toast';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const returnUrl = router.query.returnUrl as string;
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showToast.loading('Connexion en cours...');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        showToast.error(result.error || 'Erreur de connexion');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        showToast.success('Connexion réussie !');
        setIsLoading(false);
        // Forcer la mise à jour de la session
        await getSession();
        // Rediriger vers returnUrl si présent, sinon dashboard
        const returnUrl = router.query.returnUrl as string;
        if (returnUrl) {
          router.replace(returnUrl);
        } else {
          router.replace('/dashboard');
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      showToast.error('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant la vérification de la session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ne rien afficher si déjà connecté (redirection en cours)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Connexion - Easy Tech</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 rounded-full p-3">
                <FaGraduationCap className="text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Easy Tech</h1>
            <h2 className="text-2xl font-semibold text-gray-700">Connexion</h2>
            <p className="mt-2 text-sm text-gray-600">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="inline w-4 h-4 mr-2" />
                  Mot de passe
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center space-x-2"
                isLoading={isLoading}
              >
                <FiLogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

