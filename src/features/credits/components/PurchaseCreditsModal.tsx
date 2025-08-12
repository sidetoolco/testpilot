import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Tag, X } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { creditsService, CouponValidationResponse } from '../services/creditsService';
import { toast } from 'sonner';
import ModalLayout from '../../../layouts/ModalLayout';
import { formatPrice } from '../../../utils/format';
import { useRefreshCredits } from '../hooks/useRefreshCredits';

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsNeeded?: number; // Optional prop for pre-filling custom amount
}

interface CreditOption {
  credits: number;
  price: number;
  popular?: boolean;
}

const CREDIT_OPTIONS: CreditOption[] = [
  { credits: 500, price: 500 * 49 },
  { credits: 1000, price: 1000 * 49, popular: true },
  { credits: 2000, price: 2000 * 49 },
  { credits: 5000, price: 5000 * 49 },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export function PurchaseCreditsModal({ isOpen, onClose, creditsNeeded }: PurchaseCreditsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingCredits, setIsProcessingCredits] = useState(false);
  const [creditProcessingError, setCreditProcessingError] = useState<string | null>(null);
  const [selectedCredits, setSelectedCredits] = useState<number>(1000); // Default to popular option
  const [customCredits, setCustomCredits] = useState<string>('');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse['coupon'] | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string>('');
  
  const stripe = useStripe();
  const elements = useElements();
  const { refreshCredits, isRefreshing } = useRefreshCredits();

  useEffect(() => {
    if (isOpen && creditsNeeded !== undefined && creditsNeeded > 0) {
      // Check if creditsNeeded matches any predefined option
      const matchingOption = CREDIT_OPTIONS.find(option => option.credits === creditsNeeded);
      
      if (matchingOption) {
        // If it matches a predefined option, select that option
        setSelectedCredits(creditsNeeded);
        setIsCustomAmount(false);
        setCustomCredits('');
      } else {
        // If it doesn't match, set as custom amount
        setCustomCredits(creditsNeeded.toString());
        setIsCustomAmount(true);
        setSelectedCredits(0);
      }
    }
  }, [isOpen, creditsNeeded]);

  const handleCreditSelection = (credits: number) => {
    setSelectedCredits(credits);
    setIsCustomAmount(false);
    setCustomCredits('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomCredits(value);
    setIsCustomAmount(true);
    setSelectedCredits(0);
  };

  const getCurrentCredits = (): number => {
    if (isCustomAmount && customCredits) {
      const parsed = parseInt(customCredits, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedCredits;
  };

  const getCurrentPrice = () => {
    const credits = getCurrentCredits();
    // Each credit costs $49
    return formatPrice(credits * 49);
  };

  const getDiscountedPrice = () => {
    const credits = getCurrentCredits();
    const basePrice = credits * 49;
    
    if (!appliedCoupon) {
      return basePrice;
    }

    if (appliedCoupon.percent_off) {
      const discount = (basePrice * appliedCoupon.percent_off) / 100;
      return basePrice - discount;
    }

    if (appliedCoupon.amount_off) {
      const discount = appliedCoupon.amount_off / 100; // Convert cents to dollars
      return Math.max(0, basePrice - discount);
    }

    return basePrice;
  };

  const getFormattedDiscountedPrice = () => {
    return formatPrice(getDiscountedPrice());
  };

  const getDiscountAmount = () => {
    const credits = getCurrentCredits();
    const basePrice = credits * 49;
    const discountedPrice = getDiscountedPrice();
    return basePrice - discountedPrice;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await creditsService.validateCoupon(couponCode.trim());
      
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponCode('');
        toast.success(`Coupon applied: ${result.coupon.name}`);
      } else {
        const errorMessage = result.error || 'Invalid coupon code';
        setCouponError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      setCouponError('Failed to validate coupon');
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleManualRefresh = async () => {
    try {
      setIsProcessingCredits(true);
      setCreditProcessingError(null);
      
      // Use the custom hook to refresh credits silently
      const success = await refreshCredits({ silent: true });
      
      if (success) {
        setPaymentSuccess(true);
        toast.success('Credits successfully added to your account!');
      } else {
        setCreditProcessingError('Manual refresh failed. Please contact support if the issue persists.');
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setCreditProcessingError('Manual refresh failed. Please contact support if the issue persists.');
      toast.error('Failed to refresh credits. Please contact support.');
    } finally {
      setIsProcessingCredits(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const credits = getCurrentCredits();
    if (credits <= 0) {
      toast.error('Please select a valid number of credits');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent with coupon if applied
      const { clientSecret } = await creditsService.createPaymentIntent(
        credits, 
        appliedCoupon?.id
      );

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded, now process pending credits
        setIsProcessingCredits(true);
        try {
          // Use the custom hook to refresh credits silently
          const success = await refreshCredits({ silent: true });
          
          if (success) {
            setPaymentSuccess(true);
            toast.success('Payment successful! Credits added to your account.');
          } else {
            throw new Error('Failed to process credits');
          }
        } catch (creditError) {
          console.error('Failed to process credits:', creditError);
          setCreditProcessingError('Payment succeeded but failed to add credits automatically. You can try refreshing manually.');
          toast.error('Payment succeeded but failed to add credits. Please contact support.');
        } finally {
          setIsProcessingCredits(false);
        }

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setPaymentSuccess(false);
          setSelectedCredits(1000);
          setCustomCredits('');
          setIsCustomAmount(false);
          setAppliedCoupon(null);
          setCouponCode('');
          setCouponError('');
        }, 2000);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 font-medium">Credits Processing</p>
            <p className="text-sm text-green-600">Your credits are being added to your account. This may take a few moments.</p>
          </div>
          <p className="text-xs text-gray-500">You can close this window or wait for it to close automatically.</p>
        </motion.div>
      </div>
    );
  }

  if (isProcessingCredits) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center"
        >
          <div className="w-16 h-16 border-4 border-green-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Processing Credits</h3>
          <p className="text-gray-600">Please wait while we add your credits to your account...</p>
        </motion.div>
      </div>
    );
  }

  if (creditProcessingError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Credit Processing Failed</h3>
          <p className="text-gray-600 mb-6">{creditProcessingError}</p>
          <div className="space-y-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Refreshing...' : 'Try Manual Refresh'}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentCredits = getCurrentCredits();
  const currentPrice = getCurrentPrice();

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose} title="Purchase Credits">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Select Credit Package</h4>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {CREDIT_OPTIONS.map(option => (
            <button
              key={option.credits}
              onClick={() => handleCreditSelection(option.credits)}
              className={`relative p-2 rounded-xl border-2 transition-all ${
                selectedCredits === option.credits && !isCustomAmount
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </div>
              )}

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {option.credits.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Credits</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter custom amount
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              value={customCredits}
              onChange={e => handleCustomAmountChange(e.target.value)}
              placeholder="Enter number of credits"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">credits</span>
          </div>
          {isCustomAmount && customCredits && (
            <p className="text-sm text-gray-600 mt-1">$49 per credit</p>
          )}
        </div>
      </div>

      {currentCredits > 0 && (
        <div className="bg-primary-50 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-primary-700 mb-1">Selected Package</p>
            <p className="text-2xl font-bold text-primary-900">
              {currentCredits.toLocaleString()} Credits
            </p>
            <div className="flex items-center justify-center gap-2">
              {appliedCoupon ? (
                <>
                  <p className="text-lg text-primary-700 line-through">{getCurrentPrice()}</p>
                  <p className="text-lg font-bold text-green-600">{getFormattedDiscountedPrice()}</p>
                </>
              ) : (
                <p className="text-lg text-primary-700">{getCurrentPrice()}</p>
              )}
            </div>
            {appliedCoupon && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  {appliedCoupon.name} applied
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupon Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Have a coupon code?
        </label>
        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isValidatingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidatingCoupon ? 'Validating...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {appliedCoupon.name}
              </span>
              {appliedCoupon.percent_off && (
                <span className="text-xs text-green-600">
                  {appliedCoupon.percent_off}% off
                </span>
              )}
              {appliedCoupon.amount_off && (
                <span className="text-xs text-green-600">
                  ${(appliedCoupon.amount_off / 100).toFixed(2)} off
                </span>
              )}
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {couponError && (
          <p className="text-sm text-red-600 mt-1">{couponError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || currentCredits <= 0}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Pay ${getFormattedDiscountedPrice()}`}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secure and encrypted. We use Stripe to process payments.
      </p>
    </ModalLayout>
  );
}
