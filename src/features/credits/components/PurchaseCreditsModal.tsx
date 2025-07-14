import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { creditsService } from '../services/creditsService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PurchaseCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const { clientSecret } = await creditsService.createPaymentIntent(1);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-50 rounded-full p-2">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Purchase Credits</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-primary-50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-primary-700 mb-1">Credit Package</p>
              <p className="text-3xl font-bold text-primary-900">1 Credit</p>
              <p className="text-lg text-primary-700">$49.00</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            This credit can be used to run one complete test with up to 10 participants.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Pay $49.00'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment is secure and encrypted. We use Stripe to process payments.
        </p>
      </motion.div>
    </div>
  );
} 