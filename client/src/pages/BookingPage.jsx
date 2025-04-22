import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // Use your actual key

const BookingForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    packageId: '',
    customServices: [],
    timeSlot: '',
    workoutDaysPerWeek: '',
    goals: '',
    paymentInterval: 'Monthly'
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkg = await apiService.getPackages();
        const serv = await apiService.getServices();
        setPackages(pkg);
        setServices(serv);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        customServices: checked
          ? [...prev.customServices, value]
          : prev.customServices.filter(id => id !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const bookingResponse = await apiService.bookMembership(formData);
      setClientSecret(bookingResponse.clientSecret);

      const cardElement = elements.getElement(CardElement);

      const paymentResult = await stripe.confirmCardPayment(bookingResponse.clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      setSuccess("Booking and payment successful!");
    } catch (err) {
      console.log(err);
      setError(err.message || "Failed to complete booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book Your Membership</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Package:
          <select name="packageId" value={formData.packageId} onChange={handleChange} required className="w-full mt-1">
            <option value="">Select a package</option>
            {packages.map(pkg => (
              <option key={pkg._id} value={pkg._id}>
                {pkg.name} (${pkg.basePrice})
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="font-medium">Custom Services:</span>
          {services.map(service => (
            <label key={service._id} className="block">
              <input
                type="checkbox"
                value={service._id}
                onChange={handleChange}
                checked={formData.customServices.includes(service._id)}
              />
              {service.name} (${service.price})
            </label>
          ))}
        </div>

        <label className="block">
          Time Slot:
          <input type="text" name="timeSlot" value={formData.timeSlot} onChange={handleChange} required className="w-full mt-1" />
        </label>

        <label className="block">
          Days/Week:
          <input type="number" name="workoutDaysPerWeek" value={formData.workoutDaysPerWeek} onChange={handleChange} required className="w-full mt-1" />
        </label>

        <label className="block">
          Goals:
          <textarea name="goals" value={formData.goals} onChange={handleChange} required className="w-full mt-1" />
        </label>

        <label className="block">
          Payment Interval:
          <select name="paymentInterval" value={formData.paymentInterval} onChange={handleChange} required className="w-full mt-1">
            <option value="Monthly">Monthly</option>
            <option value="3 Months">3 Months</option>
            <option value="Yearly">Yearly</option>
          </select>
        </label>

        <div>
          <label className="block">Card Details</label>
          <div className="border p-2 rounded-md">
            <CardElement />
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? "Processing..." : "Confirm Booking & Pay"}
        </button>
      </form>
    </div>
  );
};

const BookingPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <BookingForm />
    </Elements>
  );
};

export default BookingPage;
