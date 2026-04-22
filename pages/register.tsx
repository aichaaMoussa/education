import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiUserPlus, FiUsers } from 'react-icons/fi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { showToast } from '../lib/toast';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roleName: 'apprenant',
  });
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'apprenant', label: 'Apprenant' },
    { value: 'formateur', label: 'Formateur' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      showToast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await showToast.promise(
        (async () => {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              roleName: formData.roleName || 'apprenant',
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(
              typeof data.message === 'string'
                ? data.message
                : 'Erreur lors de l\'inscription'
            );
          }
          return data;
        })(),
        {
          loading: 'Inscription en cours...',
          success:
            'Inscription réussie ! Redirection vers la connexion…',
          error: (err) =>
            err instanceof Error ? err.message : 'Une erreur est survenue',
        }
      );

      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1200);
    } catch {
      /* toast.promise affiche déjà l’erreur */
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - itkane</title>
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
            <h2 className="text-4xl font-semibold text-gray-700">Inscription</h2>
            <p className="text-sm text-gray-600">
              Créez votre compte pour commencer votre apprentissage
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="register-firstName"
                    className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <FiUser className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Prénom</span>
                  </label>
                  <Input
                    id="register-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="register-lastName"
                    className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <FiUser className="h-4 w-4 shrink-0" aria-hidden />
                    <span>Nom</span>
                  </label>
                  <Input
                    id="register-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiMail className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Email</span>
                </label>
                <Input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="register-role"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiUsers className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Type de compte</span>
                </label>
                <Select
                  id="register-role"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  options={roleOptions}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiLock className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Mot de passe</span>
                </label>
                <Input
                  id="register-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="register-confirmPassword"
                  className="mb-2 flex flex-row flex-nowrap items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FiLock className="h-4 w-4 shrink-0" aria-hidden />
                  <span>Confirmer le mot de passe</span>
                </label>
                <Input
                  id="register-confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-2 flex w-full flex-nowrap items-center justify-center gap-2"
                isLoading={isLoading}
              >
                <FiUserPlus className="h-5 w-5 shrink-0" aria-hidden />
                <span>S&apos;inscrire</span>
              </Button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="font-medium text-platform-600 hover:text-platform-950"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
