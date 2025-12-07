import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiUserPlus, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiMail, FiUser } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface Formateur {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function FormateursManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchFormateurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer seulement les formateurs
        const formateursData = data.filter((u: any) => 
          u.role?.name === 'formateur' || u.role?.name === 'instructor'
        );
        setFormateurs(formateursData);
      }
    } catch (error) {
      console.error('Error fetching formateurs:', error);
      showToast.error('Erreur lors du chargement des formateurs');
    }
  };

  const handleOpenModal = (formateur?: Formateur) => {
    if (formateur) {
      setIsEditMode(true);
      setSelectedFormateur(formateur);
      setFormData({
        email: formateur.email,
        password: '',
        firstName: formateur.firstName,
        lastName: formateur.lastName,
        isActive: formateur.isActive,
      });
    } else {
      setIsEditMode(false);
      setSelectedFormateur(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedFormateur(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = showToast.loading(isEditMode ? 'Mise à jour...' : 'Création...');

    try {
      const token = localStorage.getItem('token');
      // Récupérer le rôle formateur
      const rolesResponse = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roles = await rolesResponse.json();
      const formateurRole = roles.find((r: any) => r.name === 'formateur' || r.name === 'instructor');

      if (!formateurRole) {
        showToast.error('Rôle formateur non trouvé');
        setLoading(false);
        return;
      }

      const url = isEditMode && selectedFormateur
        ? `/api/admin/users/${selectedFormateur._id}`
        : '/api/admin/users';
      
      const method = isEditMode ? 'PUT' : 'POST';

      let submitData = { ...formData, roleId: formateurRole._id };
      if (isEditMode && !submitData.password) {
        const { password, ...rest } = submitData;
  submitData = rest;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Erreur lors de l\'opération');
        setLoading(false);
        return;
      }

      showToast.success(isEditMode ? 'Formateur mis à jour avec succès' : 'Formateur créé avec succès');
      await fetchFormateurs();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      showToast.error('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (formateurId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${formateurId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success('Formateur supprimé avec succès');
        await fetchFormateurs();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast.error('Une erreur est survenue');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FaChalkboardTeacher className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
      <Head>
        <title>Gestion des Formateurs - Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar items={sidebarItems} userPermissions={user?.role?.permissions || []} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                    <FaChalkboardTeacher className="text-blue-600" />
                    <span>Gestion des Formateurs</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Gérez les formateurs de la plateforme</p>
                </div>
                {user?.role?.permissions?.includes(PERMISSIONS.USER_CREATE) && (
                  <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center space-x-2">
                    <FiUserPlus className="w-5 h-5" />
                    <span>Ajouter un formateur</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formateurs.map((formateur) => (
                  <Card key={formateur._id} hover className="border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-3">
                          <FaChalkboardTeacher className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formateur.firstName} {formateur.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center space-x-1">
                            <FiMail className="w-3 h-3" />
                            <span>{formateur.email}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formateur.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formateur.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      <div className="flex space-x-2">
                        {user?.role?.permissions?.includes(PERMISSIONS.USER_UPDATE) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(formateur)}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {user?.role?.permissions?.includes(PERMISSIONS.USER_DELETE) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(formateur._id)}
                            disabled={formateur._id === user?.id}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {formateurs.length === 0 && (
                <Card className="text-center py-12">
                  <FaChalkboardTeacher className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun formateur enregistré</p>
                </Card>
              )}
            </div>
          </main>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={isEditMode ? 'Modifier le formateur' : 'Ajouter un formateur'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isEditMode}
            />

            <Input
              label={isEditMode ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEditMode}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Formateur actif
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}

