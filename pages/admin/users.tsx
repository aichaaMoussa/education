import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { FiUserPlus, FiEdit2, FiTrash2, FiMail, FiUser, FiSearch, FiUsers } from 'react-icons/fi';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    _id: string;
    name: string;
    permissions: string[];
  };
  isActive: boolean;
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        showToast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setIsEditMode(true);
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.role._id,
        isActive: user.isActive,
      });
    } else {
      setIsEditMode(false);
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roleId: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = showToast.loading(isEditMode ? 'Mise à jour...' : 'Création...');

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode && selectedUser
        ? `/api/admin/users/${selectedUser._id}`
        : '/api/admin/users';
      
      const method = isEditMode ? 'PUT' : 'POST';

      // Pour l'édition, ne pas envoyer le mot de passe s'il est vide
      const submitData = { ...formData };
      if (isEditMode && !submitData.password) {
        delete submitData.password;
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

      showToast.success(isEditMode ? 'Utilisateur mis à jour avec succès' : 'Utilisateur créé avec succès');
      await fetchUsers();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      showToast.error('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success('Utilisateur supprimé avec succès');
        await fetchUsers();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast.error('Une erreur est survenue');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      if (response.ok) {
        showToast.success('Statut utilisateur mis à jour');
        await fetchUsers();
      } else {
        const data = await response.json();
        showToast.error(data.message || 'Erreur lors de la mise à jour');
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

  const roleOptions = roles.map(role => ({
    value: role._id,
    label: role.name,
  }));

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
    { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiUser className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
      <Head>
        <title>Gestion des Utilisateurs - Admin</title>
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
                    <FiUsers className="text-blue-600" />
                    <span>Gestion des Utilisateurs</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Gérez tous les utilisateurs de la plateforme</p>
                </div>
                {user?.role?.permissions?.includes(PERMISSIONS.USER_CREATE) && (
                  <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center space-x-2">
                    <FiUserPlus className="w-5 h-5" />
                    <span>Ajouter un utilisateur</span>
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
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
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {u.role.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {user?.role?.permissions?.includes(PERMISSIONS.USER_UPDATE) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal(u)}
                                className="flex items-center space-x-1"
                              >
                                <FiEdit2 className="w-4 h-4" />
                                <span>Modifier</span>
                              </Button>
                            )}
                            {user?.role?.permissions?.includes(PERMISSIONS.USER_DELETE) && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(u._id)}
                                disabled={u._id === user?.id}
                                className="flex items-center space-x-1"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Supprimer</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={isEditMode ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
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

            <Select
              label="Rôle"
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              options={roleOptions}
              required
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
                Utilisateur actif
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

