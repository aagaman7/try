import React, { useState } from 'react';
import PackagesPage from '../components/membership/PackagesPage';
import BookingForm from '../components/membership/BookingForm';
import PaymentWrapper from '../components/membership/PaymentWrapper';

const Membership = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customServices, setCustomServices] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleBookingSubmit = (data) => {
    setBookingData(data);
    setIsPaymentVisible(true);
  };

  const handlePaymentSuccess = (booking) => {
    setBookingComplete(true);
    setIsPaymentVisible(false);
    // Optionally show a success modal or redirect
  };

  const handlePaymentCancel = () => {
    setIsPaymentVisible(false);
  };

  if (bookingComplete) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-green-600">
          Booking Successful!
        </h2>
        <p className="mt-4">Your membership is now active.</p>
      </div>
    );
  }

  return (
    <div>
      <PackagesPage 
        onPackageSelect={setSelectedPackage}
        onCustomServicesSelect={setCustomServices}
      />

      {selectedPackage && (
        <BookingForm 
          selectedPackage={selectedPackage}
          customServices={customServices}
          onSubmit={handleBookingSubmit}
        />
      )}

      {isPaymentVisible && bookingData && (
        <PaymentWrapper 
          bookingData={bookingData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default Membership;