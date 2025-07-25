import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User, Company, FormData } from '../types/user';

// Cache for page data
const pageCache = new Map<string, { data: User[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For search across all users
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Load companies (only once)
  const loadCompanies = useCallback(async () => {
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  }, []);

  // Load users for current page with caching
  const loadUsersForPage = useCallback(async (page: number, searchQuery?: string) => {
    console.log('loadUsersForPage called with page:', page, 'searchQuery:', searchQuery);
    console.log('Current companies count:', companies.length);
    
    try {
      setLoading(true);
      
      // Create cache key
      const cacheKey = searchQuery ? `search_${searchQuery}` : `page_${page}`;
      const cached = pageCache.get(cacheKey);
      const now = Date.now();

      // Check cache first
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('Using cached data for key:', cacheKey);
        setUsers(cached.data);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // If there's a search query, search across all users
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const from = (page - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      console.log('Making API call with range:', from, 'to', to);
      const { data: usersData, error: usersError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (usersError) throw usersError;

      console.log('API response - usersData:', usersData?.length, 'count:', count);

      // Map company names to users
      const usersWithCompanies = (usersData || []).map((user: any) => {
        const company = companies.find(c => c.id === user.company_id);
        return {
          ...user,
          company_name: company?.name || 'Unknown Company',
        };
      });

      console.log('Mapped users with companies:', usersWithCompanies.length);

      // Cache the result
      pageCache.set(cacheKey, { data: usersWithCompanies, timestamp: now });
      
      setUsers(usersWithCompanies);
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [companies, usersPerPage]);

  // Load all users for search (only when needed)
  const loadAllUsersForSearch = useCallback(async (searchQuery: string) => {
    try {
      const { data: allUsersData, error: allUsersError } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (allUsersError) throw allUsersError;

      // Map company names to users
      const allUsersWithCompanies = (allUsersData || []).map((user: any) => {
        const company = companies.find(c => c.id === user.company_id);
        return {
          ...user,
          company_name: company?.name || 'Unknown Company',
        };
      });

      setAllUsers(allUsersWithCompanies);
    } catch (error) {
      console.error('Error loading all users for search:', error);
    }
  }, [companies]);

  // Clear cache when data changes
  const clearCache = useCallback(() => {
    pageCache.clear();
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
      
      // Clear cache and reload current page
      clearCache();
      await loadUsersForPage(currentPage);
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [createUser, clearCache, loadUsersForPage, currentPage]);

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

      // Clear cache and reload current page
      clearCache();
      await loadUsersForPage(currentPage);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [clearCache, loadUsersForPage, currentPage]);

  // Handle delete user
  const handleDeleteUser = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Clear cache and reload current page
      clearCache();
      await loadUsersForPage(currentPage);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [clearCache, loadUsersForPage, currentPage]);

  // Search users (searches across all users)
  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // If no search query, load normal pagination
      await loadUsersForPage(1);
      setAllUsers([]);
      return;
    }

    // Search across all users
    await loadAllUsersForSearch(searchQuery);
  }, [loadUsersForPage, loadAllUsersForSearch]);

  // Pagination functions
  const getTotalPages = useCallback(() => {
    return Math.ceil(totalUsers / usersPerPage);
  }, [totalUsers, usersPerPage]);

  const goToPage = useCallback(async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    await loadUsersForPage(pageNumber);
  }, [loadUsersForPage]);

  const goToNextPage = useCallback(async () => {
    const totalPages = getTotalPages();
    const nextPage = Math.min(currentPage + 1, totalPages);
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      await loadUsersForPage(nextPage);
    }
  }, [currentPage, getTotalPages, loadUsersForPage]);

  const goToPreviousPage = useCallback(async () => {
    const prevPage = Math.max(currentPage - 1, 1);
    if (prevPage !== currentPage) {
      setCurrentPage(prevPage);
      await loadUsersForPage(prevPage);
    }
  }, [currentPage, loadUsersForPage]);

  // Reset to first page when search changes
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Get current users to display (either paginated or search results)
  const getCurrentUsers = useCallback(() => {
    // If we have search results, show those
    if (allUsers.length > 0) {
      console.log('Returning search results:', allUsers.length, 'users');
      return allUsers;
    }
    // Otherwise show paginated users
    console.log('Returning paginated users:', users.length, 'users');
    return users;
  }, [users, allUsers]);

  // Memoized values to prevent unnecessary re-renders
  const memoizedUsers = useMemo(() => getCurrentUsers(), [getCurrentUsers]);
  const memoizedTotalPages = useMemo(() => getTotalPages(), [getTotalPages]);

  // Auto-load companies when hook is initialized
  useEffect(() => {
    const initializeData = async () => {
      await loadCompanies();
    };
    initializeData();
  }, [loadCompanies]);

  // Load users after companies are loaded
  useEffect(() => {
    if (companies.length > 0) {
      loadUsersForPage(1);
    }
  }, [companies.length, loadUsersForPage]);

  return {
    users: memoizedUsers,
    companies,
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
    getTotalPages: () => memoizedTotalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    clearCache,
  };
}; 