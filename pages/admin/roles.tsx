import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { FiShield, FiEdit2, FiTrash2, FiPlus, FiCheckCircle } from 'react-icons/fi';
import ProtectedRoute from '../../components/protected/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { showToast } from '../../lib/toast';

interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  value: string;
  label: string;
  category: string;
}

export default function RolesManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        showToast.error('Erreur lors du chargement des rôles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast.error('Erreur lors du chargement des rôles');
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/permissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        setGroupedPermissions(data.grouped);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setIsEditMode(true);
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || [],
      });
    } else {
      setIsEditMode(false);
      setSelectedRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = showToast.loading(isEditMode ? 'Mise à jour...' : 'Création...');

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode && selectedRole
        ? `/api/admin/roles/${selectedRole._id}`
        : '/api/admin/roles';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Erreur lors de l\'opération');
        setLoading(false);
        return;
      }

      showToast.success(isEditMode ? 'Rôle mis à jour avec succès' : 'Rôle créé avec succès');
      await fetchRoles();
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error) {
      showToast.error('Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success('Rôle supprimé avec succès');
        await fetchRoles();
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
    { label: 'Dashboard', href: '/dashboard', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { label: 'Gestion Formateurs', href: '/admin/formateurs', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Gestion Apprenants', href: '/admin/apprenants', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.USER_READ },
    { label: 'Valider Formations', href: '/admin/courses/approve', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.COURSE_READ },
    { label: 'Statistiques', href: '/admin/statistics', icon: <FiCheckCircle className="w-5 h-5" />, permission: PERMISSIONS.DASHBOARD_ADMIN },
    { label: 'Gestion Rôles', href: '/admin/roles', icon: <FiShield className="w-5 h-5" />, permission: PERMISSIONS.ROLE_READ },
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.ROLE_READ}>
      <Head>
        <title>Gestion des Rôles - Admin</title>
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
                    <FiShield className="text-blue-600" />
                    <span>Gestion des Rôles</span>
                  </h1>
                  <p className="text-gray-600 mt-1">Gérez les rôles et leurs permissions</p>
                </div>
                {user?.role?.permissions?.includes(PERMISSIONS.ROLE_CREATE) && (
                  <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center space-x-2">
                    <FiPlus className="w-5 h-5" />
                    <span>Créer un rôle</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role._id} hover>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{role.name}</h3>
                        {role.description && (
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Permissions ({role.permissions.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {perm.split(':')[0]}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{role.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {user?.role?.permissions?.includes(PERMISSIONS.ROLE_UPDATE) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(role)}
                          className="flex-1 flex items-center justify-center space-x-1"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Modifier</span>
                        </Button>
                      )}
                      {user?.role?.permissions?.includes(PERMISSIONS.ROLE_DELETE) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(role._id)}
                          className="flex-1 flex items-center justify-center space-x-1"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Supprimer</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={isEditMode ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom du rôle"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isEditMode}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {perms.map((perm: Permission) => (
                        <label
                          key={perm.value}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.value)}
                            onChange={() => handlePermissionToggle(perm.value)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.permissions.length} permission(s) sélectionnée(s)
              </p>
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
