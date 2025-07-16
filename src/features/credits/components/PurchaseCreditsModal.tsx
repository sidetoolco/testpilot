import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { creditsService } from '../services/creditsService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ModalLayout from '../../../layouts/ModalLayout';
import { formatPrice } from '../../../utils/format';

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function PurchaseCreditsModal({ isOpen, onClose }: PurchaseCreditsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState<number>(1000); // Default to popular option
  const [customCredits, setCustomCredits] = useState<string>('');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

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
      // Create payment intent
      const { clientSecret } = await creditsService.createPaymentIntent(credits);

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        toast.success('Payment successful! Credits added to your account.');

        // Invalidate credits query to refresh data
        queryClient.invalidateQueries({ queryKey: ['credits'] });

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setPaymentSuccess(false);
          setSelectedCredits(1000);
          setCustomCredits('');
          setIsCustomAmount(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
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
          <p className="text-gray-600">Your credits have been added to your account.</p>
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
            <p className="text-lg text-primary-700">{currentPrice}</p>
          </div>
        </div>
      )}

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
          {isProcessing ? 'Processing...' : `Pay ${currentPrice}`}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secure and encrypted. We use Stripe to process payments.
      </p>
    </ModalLayout>
  );
}
