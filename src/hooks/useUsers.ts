import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, Company, FormData } from '../types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load users and companies
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load companies first
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (companiesError) throw companiesError;

      // Load users with company information
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Map company names to users
      const usersWithCompanies = (usersData || []).map((user: any) => {
        const company = companiesData?.find(c => c.id === user.company_id);
        return {
          ...user,
          company_name: company?.name || 'Unknown Company',
        };
      });

      setCompanies(companiesData || []);
      setUsers(usersWithCompanies);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create user function
  const createUser = useCallback(async (data: any) => {
    const response = await fetch(
      'https://testpilot.app.n8n.cloud/webhook/70de7235-766e-4097-b388-7829d4dff16e',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          companyName: data.companyName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return await response.json();
  }, []);

  // Handle create user
  const handleCreateUser = useCallback(async (formData: FormData) => {
    setIsCreating(true);
    try {
      await createUser(formData);
      
      // Reload users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!usersError && usersData) {
        const usersWithCompanies = usersData.map((user: any) => {
          const company = companies.find(c => c.id === user.company_id);
          return {
            ...user,
            company_name: company?.name || 'Unknown Company',
          };
        });
        setUsers(usersWithCompanies);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [createUser, companies]);

  // Handle update user
  const handleUpdateUser = useCallback(async (userId: string, formData: FormData) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          role: formData.role,
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                full_name: formData.fullName, 
                role: formData.role 
              }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Handle delete user
  const handleDeleteUser = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== userId)
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Filter users
  const getFilteredUsers = useCallback((searchQuery: string) => {
    return users.filter(user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users]);

  // Auto-load data when hook is initialized
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    users,
    companies,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    loadData,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    getFilteredUsers,
  };
}; 