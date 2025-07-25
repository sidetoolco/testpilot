import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { signupSchema } from '../features/auth/validation/schemas';
import { Users, UserPlus, Search, Loader2 } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UsersTable } from '../components/users/UsersTable';
import { UserModal } from '../components/users/UserModal';
import { DeleteUserModal } from '../components/users/DeleteUserModal';
import { User, FormData } from '../types/user';

export const Adminpanel = () => {
  const user = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    role: 'user',
  });

  const {
    users,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    currentPage,
    usersPerPage,
    totalUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    searchUsers,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  } = useUsers();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.user.id)
          .single();

        if (!error && data && typeof data === 'object' && 'role' in data) {
          setIsAdmin(data.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user?.user?.id]);

  // Note: useUsers hook will auto-load data when initialized

  // Get pagination data
  const totalPages = getTotalPages();

  // Event handlers
  const handleSearchChange = useCallback(async (value: string) => {
    setSearchQuery(value);
    resetPagination(); // Reset to first page when searching
    await searchUsers(value); // Search across all users
  }, [resetPagination, searchUsers]);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      fullName: user.full_name || '',
      companyName: user.company_name || '',
      role: user.role,
    });
    setShowEditModal(true);
  }, []);

  const handleDeleteUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      companyName: '',
      role: 'user',
    });
    setShowCreateModal(true);
  }, []);

  const handleCreateSubmit = useCallback(async (formData: FormData) => {
    try {
      const validatedData = signupSchema.parse({
        email: formData.email,
        password: formData.password || 'Get1newpr@duct',
        fullName: formData.fullName,
        companyName: formData.companyName,
      });

      await handleCreateUser({ ...validatedData, role: formData.role });
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
    }
  }, [handleCreateUser]);

  const handleEditSubmit = useCallback(async (formData: FormData) => {
    if (!selectedUser) return;

    try {
      await handleUpdateUser(selectedUser.id, formData);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
    }
  }, [handleUpdateUser, selectedUser]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await handleDeleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
    }
  }, [handleDeleteUser, selectedUser]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users across all companies</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <UsersTable
          users={users}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUserClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
          totalItems={totalUsers}
          itemsPerPage={usersPerPage}
        />
      )}

      {/* Create User Modal */}
      <UserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        formData={formData}
        onFormDataChange={setFormData}
        isLoading={isCreating}
        mode="create"
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        formData={formData}
        onFormDataChange={setFormData}
        isLoading={isUpdating}
        mode="edit"
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
        isLoading={isDeleting}
      />
    </div>
  );
};