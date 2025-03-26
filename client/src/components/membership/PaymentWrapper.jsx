import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ bookingData, onPaymentSuccess, onPaymentCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    try {
      // Create booking and get client secret
      const bookingResponse = await axios.post('/api/bookings', bookingData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      const { clientSecret } = bookingResponse.data;

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData.name // If you have user's name
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        onPaymentSuccess(bookingResponse.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onPaymentCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Card Details</label>
            <CardElement 
              options={{
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
              }}
            />
          </div>

          {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!stripe || processing}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PaymentWrapper = ({ bookingData, onPaymentSuccess, onPaymentCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        bookingData={bookingData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentCancel={onPaymentCancel}
      />
    </Elements>
  );
};

export default PaymentWrapper;