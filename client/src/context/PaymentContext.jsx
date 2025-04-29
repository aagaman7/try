// src/context/PaymentContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentModal from '../components/PaymentModal';

// Initialize Stripe (this would use your env variable in production)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentItems, setPaymentItems] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessCallback, setPaymentSuccessCallback] = useState(null);
  const [clientSecretFetcher, setClientSecretFetcher] = useState(null);

  const openPaymentModal = ({
    clientSecret = null,
    amount,
    items = [],
    email = '',
    onSuccess = null,
    fetchClientSecret = null,
  }) => {
    setPaymentClientSecret(clientSecret);
    setPaymentAmount(amount);
    setPaymentItems(items);
    setUserEmail(email);
    setPaymentSuccessCallback(onSuccess);
    setClientSecretFetcher(fetchClientSecret);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentClientSecret(null);
    setProcessingPayment(false);
    setPaymentSuccessCallback(null);
    setClientSecretFetcher(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        openPaymentModal,
        closePaymentModal,
      }}
    >
      {children}
      
      <Elements stripe={stripePromise}>
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          clientSecret={paymentClientSecret}
          amount={paymentAmount}
          items={paymentItems}
          email={userEmail}
          onSuccess={paymentSuccessCallback}
          processingPayment={processingPayment}
          setProcessingPayment={setProcessingPayment}
          fetchClientSecret={clientSecretFetcher}
        />
      </Elements>
    </PaymentContext.Provider>
  );
};

export default PaymentContext;