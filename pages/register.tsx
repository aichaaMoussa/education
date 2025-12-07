import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiUserPlus, FiChalkboard } from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
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
    roleName: 'student',
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
    const loadingToast = showToast.loading('Inscription en cours...');

    try {
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

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Erreur lors de l\'inscription');
        setIsLoading(false);
        return;
      }

      showToast.success('Inscription réussie ! Vous pouvez maintenant vous connecter');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1500);
    } catch (err) {
      showToast.error('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - Easy Tech</title>
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
            <h2 className="text-2xl font-semibold text-gray-700">Inscription</h2>
            <p className="mt-2 text-sm text-gray-600">
              Créez votre compte pour commencer votre apprentissage
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline w-4 h-4 mr-2" />
                  Type de compte
                </label>
                <Select
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  options={roleOptions}
                />
              </div>

              <Input
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />

              <Input
                label="Confirmer le mot de passe"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full flex items-center justify-center space-x-2"
                isLoading={isLoading}
              >
                <FiUserPlus className="w-5 h-5" />
                <span>S'inscrire</span>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
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

