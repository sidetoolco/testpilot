import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Search, Loader2 } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UsersTable } from '../components/users/UsersTable';
import { UserModal } from '../components/users/UserModal';
import { DeleteUserModal } from '../components/users/DeleteUserModal';
import { User, FormData } from '../types/user';
import { useAdmin } from '../hooks/useAdmin';

export const Adminpanel = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    role: 'admin',
  });

  const {
    users,
    loading,
    isUpdating,
    isDeleting,
    currentPage,
    usersPerPage,
    totalUsers,
    handleUpdateUser,
    handleDeleteUser,
    searchUsers,
    getTotalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  } = useUsers();

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

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedUser(null);
    // Clear form data when closing
    setFormData({
      email: '',
      password: '',
      fullName: '',
      companyName: '',
      role: 'admin',
    });
  }, []);

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

  if (adminLoading) {
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

      {/* Edit User Modal */}
      <UserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
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