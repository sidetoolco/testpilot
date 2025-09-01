import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Plus, Percent, DollarSign, Calendar, Users, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../lib/api';
import { DEFAULT_ERROR_MSG } from '../lib/constants';
import ModalLayout from '../layouts/ModalLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAdmin } from '../hooks/useAdmin';

// Custom styles for DatePicker
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: all 0.2s;
  }
  .react-datepicker__input-container input:focus {
    outline: none;
    border-color: #00A67E;
    box-shadow: 0 0 0 2px rgba(0, 166, 126, 0.1);
  }
  .react-datepicker {
    font-family: inherit;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .react-datepicker__header {
    background-color: #00A67E;
    border-bottom: 1px solid #d1d5db;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: white;
  }
  .react-datepicker__day:hover {
    background-color: #00A67E;
    color: white;
  }
  .react-datepicker__day--selected {
    background-color: #00A67E;
    color: white;
  }
  .react-datepicker__time-container {
    border-left: 1px solid #d1d5db;
  }
  .react-datepicker__time-container .react-datepicker__time {
    background-color: white;
  }
  .react-datepicker__time-list-item--selected {
    background-color: #00A67E;
    color: white;
  }
`;

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
  redeem_by?: Date;
}

interface EditCouponForm extends CreateCouponForm {
  id: string;
}

export default function Coupons() {
  const { isAdmin } = useAdmin();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCouponForm>({
    name: '',
    currency: 'usd',
    duration: 'once',
  });
  const [editFormData, setEditFormData] = useState<EditCouponForm>({
    id: '',
    name: '',
    currency: 'usd',
    duration: 'once',
  });

  // Inject custom DatePicker styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = datePickerStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
        couponData.amount_off = Math.round(formData.amount_off * 100); // Convert dollars to cents
      }

      if (formData.duration === 'repeating' && formData.duration_in_months) {
        couponData.duration_in_months = formData.duration_in_months;
      }

      if (formData.max_redemptions) {
        couponData.max_redemptions = formData.max_redemptions;
      }

      if (formData.redeem_by) {
        couponData.redeem_by = formData.redeem_by.getTime() / 1000; // Convert Date to Unix timestamp
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

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setEditFormData({
      id: coupon.id,
      name: coupon.name || '',
      percent_off: coupon.percent_off,
      amount_off: coupon.amount_off ? coupon.amount_off / 100 : undefined, // Convert cents to dollars
      currency: coupon.currency || 'usd',
      duration: coupon.duration,
      duration_in_months: coupon.duration_in_months,
      max_redemptions: coupon.max_redemptions,
      redeem_by: coupon.redeem_by ? new Date(coupon.redeem_by * 1000) : undefined,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.name.trim()) {
      toast.error('Coupon name is required');
      return;
    }

    try {
      setEditingCoupon(true);
      
      // Stripe only allows updating certain fields: name, redeem_by, metadata
      const couponData: any = {
        name: editFormData.name,
      };

      // Only include redeem_by if it's set
      if (editFormData.redeem_by) {
        couponData.redeem_by = editFormData.redeem_by.getTime() / 1000; // Convert Date to Unix timestamp
      }

      const response = await apiClient.post(`/stripe/coupons/${editFormData.id}`, couponData);
      
      setCoupons(prev => prev.map(coupon => 
        coupon.id === editFormData.id ? response.data : coupon
      ));
      setIsEditModalOpen(false);
      setEditingCouponId(null);
      setEditFormData({
        id: '',
        name: '',
        currency: 'usd',
        duration: 'once',
      });
      
      toast.success('Coupon updated successfully');
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.message || DEFAULT_ERROR_MSG);
    } finally {
      setEditingCoupon(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCouponId(null);
    setEditFormData({
      id: '',
      name: '',
      currency: 'usd',
      duration: 'once',
    });
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
    const date = new Date(timestamp * 1000);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return `${dateStr} ${timeStr}`;
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.percent_off) {
      return `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      const amount = coupon.amount_off / 100; // Convert cents to dollars
      const currency = coupon.currency?.toUpperCase() || 'USD';
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
      return `${symbol}${amount.toFixed(2)} off`;
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCoupon(coupon)}
                    className="text-yellow-600 hover:text-yellow-700 transition-colors"
                    title="Edit coupon"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                 
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
                Coupon Name <span className="text-red-500">*</span>
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
                  Percent Off (%) <span className="text-red-500">*</span>
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
                  Amount Off ($) <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount_off"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount_off || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    amount_off: e.target.value ? Number(e.target.value) : undefined,
                    percent_off: undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  placeholder="10.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                              <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <input
                    id="currency"
                    value="USD"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    readOnly
                  />
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
                  Expires At
                </label>
                <DatePicker
                  selected={formData.redeem_by}
                  onChange={(date) => setFormData(prev => ({ 
                    ...prev, 
                    redeem_by: date || undefined 
                  }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select expiration date and time (optional)"
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                  isClearable
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

      {/* Edit Coupon Modal */}
      {isEditModalOpen && (
        <ModalLayout isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Edit Coupon">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Stripe only allows updating the coupon name and expiration date. 
              Discount amount, duration, and other settings cannot be changed after creation.
            </p>
          </div>
          
          <form onSubmit={handleUpdateCoupon} className="space-y-4">
            <div>
              <label htmlFor="edit_name" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit_name"
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                placeholder="e.g., SUMMER20, WELCOME10"
              />
            </div>

            <div>
              <label htmlFor="edit_redeem_by" className="block text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <DatePicker
                selected={editFormData.redeem_by}
                onChange={(date) => setEditFormData(prev => ({ 
                  ...prev, 
                  redeem_by: date || undefined 
                }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select expiration date and time (optional)"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A67E] focus:border-[#00A67E]"
                isClearable
              />
            </div>

            {/* Display current coupon details (read-only) */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Coupon Details (Read-only)</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Discount:</span> {editFormData.percent_off ? `${editFormData.percent_off}% off` : editFormData.amount_off ? `$${editFormData.amount_off} off` : 'No discount'}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {editFormData.duration === 'once' ? 'One-time use' : editFormData.duration === 'repeating' ? `Repeating (${editFormData.duration_in_months} months)` : 'Forever'}
                </div>
                <div>
                  <span className="font-medium">Max Redemptions:</span> {editFormData.max_redemptions || 'Unlimited'}
                </div>
                <div>
                  <span className="font-medium">Currency:</span> {editFormData.currency?.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editingCoupon}
                className="px-4 py-2 bg-[#00A67E] text-white rounded-md hover:bg-[#008F6B] transition-colors disabled:opacity-50"
              >
                {editingCoupon ? 'Updating...' : 'Update Coupon'}
              </button>
            </div>
          </form>
        </ModalLayout>
      )}
    </div>
  );
} 