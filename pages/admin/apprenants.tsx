import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiUserPlus, FiEdit2, FiTrash2, FiMail, FiUser, FiSearch } from 'react-icons/fi';
import { FaUserGraduate } from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface Apprenant {
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

export default function ApprenantsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [apprenants, setApprenants] = useState<Apprenant[]>([]);
  const [filteredApprenants, setFilteredApprenants] = useState<Apprenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedApprenant, setSelectedApprenant] = useState<Apprenant | null>(null);
  const [formData, setFormData] = useState<any>({
    email: '',
    password: '', // peut rester string vide
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
    fetchApprenants();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = apprenants.filter(a =>
        a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApprenants(filtered);
    } else {
      setFilteredApprenants(apprenants);
    }
  }, [searchTerm, apprenants]);

  const fetchApprenants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer seulement les apprenants
        const apprenantsData = data.filter((u: any) => 
          u.role?.name === 'apprenant' || u.role?.name === 'student'
        );
        setApprenants(apprenantsData);
        setFilteredApprenants(apprenantsData);
      }
    } catch (error) {
      console.error('Error fetching apprenants:', error);
      showToast.error('Erreur lors du chargement des apprenants');
    }
  };

  const handleOpenModal = (apprenant?: Apprenant) => {
    if (apprenant) {
      setIsEditMode(true);
      setSelectedApprenant(apprenant);
      setFormData({
        email: apprenant.email,
        password: '',
        firstName: apprenant.firstName,
        lastName: apprenant.lastName,
        isActive: apprenant.isActive,
      });
    } else {
      setIsEditMode(false);
      setSelectedApprenant(null);
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
    setSelectedApprenant(null);
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
      // Récupérer le rôle apprenant
      const rolesResponse = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roles = await rolesResponse.json();
      const apprenantRole = roles.find((r: any) => r.name === 'apprenant' || r.name === 'student');

      if (!apprenantRole) {
        showToast.error('Rôle apprenant non trouvé');
        setLoading(false);
        return;
      }

      const url = isEditMode && selectedApprenant
        ? `/api/admin/users/${selectedApprenant._id}`
        : '/api/admin/users';
      
      const method = isEditMode ? 'PUT' : 'POST';

      let submitData = { ...formData, roleId: apprenantRole._id };
      if (isEditMode && !submitData.password) {
        delete submitData.password; // Supprime le mot de passe vide
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

      showToast.success(isEditMode ? 'Apprenant mis à jour avec succès' : 'Apprenant créé avec succès');
      await fetchApprenants();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      showToast.error('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (apprenantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet apprenant ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${apprenantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success('Apprenant supprimé avec succès');
        await fetchApprenants();
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
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
      <Head>
        <title>Gestion des Apprenants - Admin</title>
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
                    <FaUserGraduate className="text-blue-600" />
                    <span>Gestion des Apprenants</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Gérez les apprenants de la plateforme</p>
                </div>
                {user?.role?.permissions?.includes(PERMISSIONS.USER_CREATE) && (
                  <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center space-x-2">
                    <FiUserPlus className="w-5 h-5" />
                    <span>Ajouter un apprenant</span>
                  </Button>
                )}
              </div>

              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher un apprenant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apprenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApprenants.map((apprenant) => (
                      <tr key={apprenant._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUserGraduate className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {apprenant.firstName} {apprenant.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <FiMail className="w-4 h-4" />
                            <span>{apprenant.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(apprenant.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            apprenant.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {apprenant.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {user?.role?.permissions?.includes(PERMISSIONS.USER_UPDATE) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal(apprenant)}
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </Button>
                            )}
                            {user?.role?.permissions?.includes(PERMISSIONS.USER_DELETE) && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(apprenant._id)}
                                disabled={apprenant._id === user?.id}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredApprenants.length === 0 && (
                <Card className="text-center py-12 mt-6">
                  <FaUserGraduate className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucun apprenant trouvé' : 'Aucun apprenant enregistré'}
                  </p>
                </Card>
              )}
            </div>
          </main>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={isEditMode ? 'Modifier l\'apprenant' : 'Ajouter un apprenant'}
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
                Apprenant actif
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

