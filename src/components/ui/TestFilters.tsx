import React from 'react';

interface TestFiltersProps {
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  blockedFilter: 'all' | 'blocked' | 'unblocked';
  setBlockedFilter: (value: 'all' | 'blocked' | 'unblocked') => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  timeFilter: 'all' | 'today' | 'week' | 'month' | 'year';
  setTimeFilter: (value: 'all' | 'today' | 'week' | 'month' | 'year') => void;
  isAdmin: boolean;
}

export default function TestFilters({
  companyFilter,
  setCompanyFilter,
  blockedFilter,
  setBlockedFilter,
  statusFilter,
  setStatusFilter,
  timeFilter,
  setTimeFilter,
  isAdmin
}: TestFiltersProps) {
  const hasActiveFilters = companyFilter || blockedFilter !== 'all' || statusFilter !== 'all' || timeFilter !== 'all';

  const clearAllFilters = () => {
    setCompanyFilter('');
    setBlockedFilter('all');
    setStatusFilter('all');
    setTimeFilter('all');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 ">
      {/* Company Filter - Admin Only */}
      {isAdmin && (
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            placeholder="Company..."
            className="w-45  py-2 px-1 text-sm border border-gray-200 rounded-lg focus:outline-none  focus:ring-primary-400 focus:border-transparent shadow-sm"
          />
        </div>
      )}

      {/* Test Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm"
      >
        <option value="all">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="complete">Complete</option>
        <option value="incomplete">Incomplete</option>
      </select>

      {/* Blocked Status Filter - Admin Only */}
      {isAdmin && (
        <select
          value={blockedFilter}
          onChange={(e) => setBlockedFilter(e.target.value as 'all' | 'blocked' | 'unblocked')}
          className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm"
        >
          <option value="all">All Blocked</option>
          <option value="blocked">Blocked</option>
          <option value="unblocked">Unblocked</option>
        </select>
      )}

      {/* Time Filter */}
      <select
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'year')}
        className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="px-2 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
