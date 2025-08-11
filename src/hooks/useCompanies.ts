import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import apiClient from '../lib/api';

interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  credits?: number;
  user_count?: number;
  test_count?: number;
  waiting_list?: boolean;
  expert_mode?: boolean;
}

interface CompanyWithDetails extends Company {
  profiles: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  }>;
  tests: Array<{
    id: string;
    name: string;
    status: string;
    created_at: string;
  }>;
}

// Cache for page data
const pageCache = new Map<string, { data: Company[]; totalCount: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCompanies = (isAdmin: boolean | null) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // For search across all companies
  const [loading, setLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(9);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // Load companies for current page with caching
  const loadCompaniesForPage = useCallback(async (page: number, searchQuery?: string) => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      
      // Create cache key
      const cacheKey = searchQuery ? `search_${searchQuery}` : `page_${page}`;
      const cached = pageCache.get(cacheKey);
      const now = Date.now();

      // Check cache first
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setCompanies(cached.data);
        setTotalCompanies(cached.totalCount);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('companies')
        .select('*', { count: 'exact' });

      // If there's a search query, search across all companies
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Add pagination
      const from = (page - 1) * companiesPerPage;
      const to = from + companiesPerPage - 1;
      
      const { data: companiesData, error: companiesError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (companiesError) throw companiesError;

      // Get additional data for each company
      const companiesWithDetails = await Promise.all(
        (companiesData || []).map(async (company: any) => {
          try {
            // Get user count
            const { count: userCount } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            // Get test count
            const { count: testCount } = await supabase
              .from('tests')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            // Get credits for this company using the company-specific endpoint
            let companyCredits = 0;
            try {
              const { data: creditsData } = await apiClient.get(`/credits/company/${company.id}`);
              companyCredits = creditsData?.total || 0;
            } catch (error) {
              console.error(`Error fetching credits for company ${company.id}:`, error);
            }

            return {
              ...company,
              user_count: userCount || 0,
              test_count: testCount || 0,
              credits: companyCredits,
            };
          } catch (error) {
            console.error(`Error fetching details for company ${company.id}:`, error);
            return {
              ...company,
              user_count: 0,
              test_count: 0,
              credits: 0,
            };
          }
        })
      );

      // Cache the result
      pageCache.set(cacheKey, { data: companiesWithDetails, totalCount: count || 0, timestamp: now });
      
      setCompanies(companiesWithDetails);
      setTotalCompanies(count || 0);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, companiesPerPage]);

  // Load all companies for search (only when needed)
  const loadAllCompaniesForSearch = useCallback(async (searchQuery: string) => {
    if (!isAdmin) return;

    try {
      const { data: allCompaniesData, error: allCompaniesError } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (allCompaniesError) throw allCompaniesError;

      // Get additional data for each company
      const allCompaniesWithDetails = await Promise.all(
        (allCompaniesData || []).map(async (company: any) => {
          try {
            // Get user count
            const { count: userCount } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            // Get test count
            const { count: testCount } = await supabase
              .from('tests')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company.id);

            // Get credits for this company using the company-specific endpoint
            let companyCredits = 0;
            try {
              const { data: creditsData } = await apiClient.get(`/credits/company/${company.id}`);
              companyCredits = creditsData?.total || 0;
            } catch (error) {
              console.error(`Error fetching credits for company ${company.id}:`, error);
            }

            return {
              ...company,
              user_count: userCount || 0,
              test_count: testCount || 0,
              credits: companyCredits,
            };
          } catch (error) {
            console.error(`Error fetching details for company ${company.id}:`, error);
            return {
              ...company,
              user_count: 0,
              test_count: 0,
              credits: 0,
            };
          }
        })
      );

      setAllCompanies(allCompaniesWithDetails);
    } catch (error) {
      console.error('Error loading all companies for search:', error);
    }
  }, [isAdmin]);

  const clearCache = useCallback(() => {
    pageCache.clear();
  }, []);

  const updateCompanyCredits = useCallback((companyId: string, newCredits: number) => {
    setCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === companyId
          ? { ...company, credits: newCredits }
          : company
      )
    );
    setAllCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === companyId
          ? { ...company, credits: newCredits }
          : company
      )
    );
  }, []);

  const updateCompanyWaitingList = useCallback(async (companyId: string, waitingList: boolean) => {
    try {
      // Update the company's waiting list status in the database
      const { error } = await supabase
        .from('companies')
        .update({ waiting_list: waitingList } as any)
        .eq('id', companyId as any);

      if (error) throw error;

      // Update local state
      setCompanies(prevCompanies =>
        prevCompanies.map(company =>
          company.id === companyId
            ? { ...company, waiting_list: waitingList }
            : company
        )
      );
      setAllCompanies(prevCompanies =>
        prevCompanies.map(company =>
          company.id === companyId
            ? { ...company, waiting_list: waitingList }
            : company
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating company waiting list status:', error);
      throw error;
    }
  }, []);

  const removeCompany = useCallback((companyId: string) => {
    setCompanies(prevCompanies =>
      prevCompanies.filter(company => company.id !== companyId)
    );
    setAllCompanies(prevCompanies =>
      prevCompanies.filter(company => company.id !== companyId)
    );
  }, []);

  // Search companies (searches across all companies)
  const searchCompanies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // If no search query, load normal pagination
      await loadCompaniesForPage(1);
      setAllCompanies([]);
      setIsSearchMode(false);
      return;
    }

    // Search across all companies
    await loadAllCompaniesForSearch(searchQuery);
    setIsSearchMode(true);
  }, [loadCompaniesForPage, loadAllCompaniesForSearch]);

  // Pagination functions
  const getTotalPages = useCallback(() => {
    return Math.ceil(totalCompanies / companiesPerPage);
  }, [totalCompanies, companiesPerPage]);

  const goToPage = useCallback(async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    await loadCompaniesForPage(pageNumber);
  }, [loadCompaniesForPage]);

  const goToNextPage = useCallback(async () => {
    const totalPages = getTotalPages();
    const nextPage = Math.min(currentPage + 1, totalPages);
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
      await loadCompaniesForPage(nextPage);
    }
  }, [currentPage, getTotalPages, loadCompaniesForPage]);

  const goToPreviousPage = useCallback(async () => {
    const prevPage = Math.max(currentPage - 1, 1);
    if (prevPage !== currentPage) {
      setCurrentPage(prevPage);
      await loadCompaniesForPage(prevPage);
    }
  }, [currentPage, loadCompaniesForPage]);

  // Reset to first page when search changes
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Get current companies to display (either paginated or search results)
  const getCurrentCompanies = useCallback(() => {
    // If we're in search mode, show search results (even if empty)
    if (isSearchMode) {
      return allCompanies;
    }
    // Otherwise show paginated companies
    return companies;
  }, [companies, allCompanies, isSearchMode]);

  // Memoized values to prevent unnecessary re-renders
  const memoizedCompanies = useMemo(() => getCurrentCompanies(), [getCurrentCompanies]);
  const memoizedTotalPages = useMemo(() => getTotalPages(), [getTotalPages]);

  // Auto-load data when isAdmin is determined
  useEffect(() => {
    if (isAdmin !== null) {
      loadCompaniesForPage(1);
    }
  }, [isAdmin, loadCompaniesForPage]);

  return {
    companies: memoizedCompanies,
    loading,
    currentPage,
    companiesPerPage,
    totalCompanies,
    clearCache,
    updateCompanyCredits,
    updateCompanyWaitingList,
    removeCompany,
    searchCompanies,
    getTotalPages: () => memoizedTotalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  };
}; 