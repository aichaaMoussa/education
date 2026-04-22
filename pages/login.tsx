import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession, getSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
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

    try {
      await showToast.promise(
        (async () => {
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
          if (result?.error) {
            throw new Error(result.error || 'Erreur de connexion');
          }
          if (!result?.ok) {
            throw new Error('Impossible de se connecter');
          }
          return result;
        })(),
        {
          loading: 'Connexion en cours...',
          success: 'Connexion réussie !',
          error: (err) =>
            err instanceof Error ? err.message : 'Une erreur est survenue',
        }
      );

      await getSession();
      const returnUrl = router.query.returnUrl as string | undefined;
      router.replace(returnUrl ?? '/dashboard');
    } catch {
      /* toast.promise affiche déjà l’erreur */
    } finally {
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
        <title>Connexion - itkane</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-platform-200/30 via-white to-platform-400/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <Image
              src="/images/Group.png"
              alt="Communauté itkane"
              width={160}
              height={90}
              className="h-auto w-[120px] shrink-0 translate-x-2 object-contain object-center sm:translate-x-3"
              priority
            />
            <h2 className="text-4xl font-semibold text-gray-700">Connexion</h2>
            <p className="text-sm text-gray-600">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiMail className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Email</span>
                </label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiLock className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Mot de passe</span>
                </label>
                <Input
                  id="login-password"
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
                className="flex w-full flex-nowrap items-center justify-center gap-2"
                isLoading={isLoading}
              >
                <FiLogIn className="h-5 w-5 shrink-0" aria-hidden />
                <span>Se connecter</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/register" className="font-medium text-platform-600 hover:text-platform-950">
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

