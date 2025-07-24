import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Plus, Percent, DollarSign, Calendar, Users, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../lib/api';
import { DEFAULT_ERROR_MSG } from '../lib/constants';
import ModalLayout from '../layouts/ModalLayout';

interface Coupon {
  id: string;
  name?: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months?: number;
  max_redemptions?: number;
  redeem_by?: number;
  valid: boolean;
  created: number;
  times_redeemed: number;
}

interface CreateCouponForm {
  name: string;
  percent_off?: number;
  amount_off?: number;
  currency: string;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months?: number;
  max_redemptions?: number;
  redeem_by?: number;
}

export default function Coupons() {
  const user = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [formData, setFormData] = useState<CreateCouponForm>({
    name: '',
    currency: 'usd',
    duration: 'once',
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id as any)
        .single();

      if (!error && data) {
        setIsAdmin((data as any).role === 'admin');
      }
    };

    checkAdminRole();
  }, [user?.user?.id]);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/stripe/coupons');
        setCoupons(response.data.data || []);
      } catch (error: any) {
        console.error('Error fetching coupons:', error);
        toast.error(error.response?.data?.message || DEFAULT_ERROR_MSG);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Coupon name is required');
      return;
    }

    if (!formData.percent_off && !formData.amount_off) {
      toast.error('Either percent off or amount off is required');
      return;
    }

    if (formData.percent_off && formData.amount_off) {
      toast.error('Only one discount type can be specified');
      return;
    }

    try {
      setCreatingCoupon(true);
      
      const couponData: any = {
        name: formData.name,
        currency: formData.currency,
        duration: formData.duration,
      };

      if (formData.percent_off) {
        couponData.percent_off = formData.percent_off;
      } else if (formData.amount_off) {
        couponData.amount_off = formData.amount_off;
      }

      if (formData.duration === 'repeating' && formData.duration_in_months) {
        couponData.duration_in_months = formData.duration_in_months;
      }

      if (formData.max_redemptions) {
        couponData.max_redemptions = formData.max_redemptions;
      }

      if (formData.redeem_by) {
        couponData.redeem_by = formData.redeem_by;
      }

      const response = await apiClient.post('/stripe/coupons', couponData);
      
      setCoupons(prev => [response.data, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        currency: 'usd',
        duration: 'once',
      });
      
      toast.success('Coupon created successfully');
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || DEFAULT_ERROR_MSG);
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await apiClient.delete(`/stripe/coupons/${couponId}`);
      setCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
      toast.success('Coupon deleted successfully');
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.message || DEFAULT_ERROR_MSG);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.percent_off) {
      return `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      const amount = coupon.amount_off / 100; // Convert cents to dollars
      return `$${amount} off`;
    }
    return 'No discount';
  };

  const getDurationText = (coupon: Coupon) => {
    switch (coupon.duration) {
      case 'once':
        return 'One-time use';
      case 'repeating':
        return `Repeating (${coupon.duration_in_months} months)`;
      case 'forever':
        return 'Forever';
      default:
        return 'Unknown';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A67E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-[#00A67E] text-white rounded-lg hover:bg-[#008F6B] transition-colors"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Percent className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
          <p className="text-gray-600 mb-4">Create your first coupon to start offering discounts to your customers.</p>
          <button
            className="px-4 py-2 bg-[#00A67E] text-white rounded-lg hover:bg-[#008F6B] transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {coupon.name || 'Unnamed Coupon'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      coupon.valid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.valid ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">ID: {coupon.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete coupon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {coupon.percent_off ? (
                    <Percent className="h-4 w-4 text-green-600" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-medium text-green-600">
                    {getDiscountText(coupon)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{getDurationText(coupon)}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {coupon.times_redeemed} used
                    {coupon.max_redemptions && ` / ${coupon.max_redemptions} max`}
                  </span>
                </div>

                {coupon.redeem_by && (
                  <div className="text-sm text-gray-600">
                    Expires: {formatDate(coupon.redeem_by)}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created: {formatDate(coupon.created)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <ModalLayout isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Coupon">
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                placeholder="e.g., SUMMER20, WELCOME10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="percent_off" className="block text-sm font-medium text-gray-700 mb-1">
                  Percent Off (%)
                </label>
                <input
                  id="percent_off"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percent_off || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    percent_off: e.target.value ? Number(e.target.value) : undefined,
                    amount_off: undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="20"
                />
              </div>

              <div>
                <label htmlFor="amount_off" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Off (cents)
                </label>
                <input
                  id="amount_off"
                  type="number"
                  min="1"
                  value={formData.amount_off || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amount_off: e.target.value ? Number(e.target.value) : undefined,
                    percent_off: undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="1000 (=$10)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: e.target.value as 'once' | 'repeating' | 'forever' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                >
                  <option value="once">One-time use</option>
                  <option value="repeating">Repeating</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
            </div>

            {formData.duration === 'repeating' && (
              <div>
                <label htmlFor="duration_in_months" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration in Months
                </label>
                <input
                  id="duration_in_months"
                  type="number"
                  min="1"
                  value={formData.duration_in_months || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration_in_months: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="3"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="max_redemptions" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Redemptions
                </label>
                <input
                  id="max_redemptions"
                  type="number"
                  min="0"
                  value={formData.max_redemptions || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_redemptions: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="100 (optional)"
                />
              </div>

              <div>
                <label htmlFor="redeem_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (timestamp)
                </label>
                <input
                  id="redeem_by"
                  type="number"
                  min={Math.floor(Date.now() / 1000)}
                  value={formData.redeem_by || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    redeem_by: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="Unix timestamp (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingCoupon}
                className="px-4 py-2 bg-[#00A67E] text-white rounded-md hover:bg-[#008F6B] transition-colors disabled:opacity-50"
              >
                {creatingCoupon ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </ModalLayout>
      )}
    </div>
  );
} 