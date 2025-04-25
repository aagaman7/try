import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

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
  
  // States for existing membership
  const [currentMembership, setCurrentMembership] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [priceSummary, setPriceSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get packages and services
        const pkg = await apiService.getPackages();
        const serv = await apiService.getServices();
        setPackages(pkg);
        setServices(serv);
        
        // Check if user already has a membership
        try {
          const dashboardData = await apiService.get('dashboard');
          if (dashboardData && dashboardData.membershipDetails) {
            setCurrentMembership(dashboardData.membershipDetails);
            
            // Pre-fill form with current membership data
            setFormData({
              packageId: dashboardData.membershipDetails.package._id,
              customServices: dashboardData.membershipDetails.customServices.map(service => service._id),
              timeSlot: dashboardData.membershipDetails.timeSlot || '',
              workoutDaysPerWeek: dashboardData.membershipDetails.workoutDaysPerWeek || '',
              goals: dashboardData.membershipDetails.goals || '',
              paymentInterval: dashboardData.membershipDetails.paymentInterval || 'Monthly'
            });
            
            setIsEditMode(true);
          }
        } catch (err) {
          // No active membership or error fetching it
          console.log("No active membership found:", err.message);
        }
      } catch (err) {
        console.error(err.message);
        setError("Failed to load necessary data. Please try again.");
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

  const previewPriceChange = async () => {
    if (!formData.packageId) {
      setError("Please select a package first");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Only call the API if in edit mode
      if (isEditMode) {
        const priceResponse = await apiService.put('bookings/upgrade', formData);
        setPriceSummary(priceResponse);
      } else {
        // Just calculate the price for new memberships
        // Find selected package
        const selectedPackage = packages.find(p => p._id === formData.packageId);
        
        // Calculate custom services total
        const selectedServices = services.filter(s => formData.customServices.includes(s._id));
        const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
        
        // Apply payment interval multiplier
        const intervalMultiplier = {
          'Monthly': 1,
          '3 Months': 3,
          'Yearly': 12
        };
        
        const totalPrice = (selectedPackage.basePrice + servicesTotal) * intervalMultiplier[formData.paymentInterval];
        
        setPriceSummary({
          originalPrice: 0,
          newPrice: totalPrice,
          remainingValue: 0,
          amountCharged: totalPrice,
          requiresPayment: true
        });
      }
    } catch (err) {
      setError(err.message || "Failed to calculate price changes");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      let bookingResponse;
      
      if (isEditMode) {
        // Handle membership upgrade
        bookingResponse = await apiService.put('bookings/upgrade', formData);
        if (bookingResponse.requiresPayment) {
          setClientSecret(bookingResponse.clientSecret);
        } else {
          // No payment needed (downgrade or lateral change)
          setSuccess("Membership updated successfully!");
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          return;
        }
      } else {
        // Create new membership
        bookingResponse = await apiService.post('bookings', formData);
        setClientSecret(bookingResponse.clientSecret);
      }

      const cardElement = elements.getElement(CardElement);

      const paymentResult = await stripe.confirmCardPayment(bookingResponse.clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      setSuccess(isEditMode ? "Membership updated successfully!" : "Booking and payment successful!");
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.log(err);
      setError(err.message || (isEditMode ? "Failed to update membership." : "Failed to complete booking."));
    } finally {
      setIsProcessing(false);
    }
  };

  // Get the current package price
  const getCurrentPackagePrice = () => {
    if (!formData.packageId) return 0;
    const pkg = packages.find(p => p._id === formData.packageId);
    return pkg ? pkg.basePrice : 0;
  };

  // Get the total services price
  const getServicesTotal = () => {
    if (!formData.customServices.length) return 0;
    return services
      .filter(s => formData.customServices.includes(s._id))
      .reduce((sum, service) => sum + service.price, 0);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? "Modify Your Membership" : "Book Your Membership"}
      </h2>
      
      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="font-medium">You have an active membership</p>
          <p className="text-sm text-gray-600">
            Any changes will affect your current subscription
          </p>
        </div>
      )}
      
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

        {/* Price Preview Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={previewPriceChange}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            disabled={isProcessing}
          >
            {isProcessing ? "Calculating..." : "Preview Price"}
          </button>
        </div>

        {/* Price Summary */}
        {priceSummary && (
          <div className="border p-3 rounded-md bg-gray-50">
            <h3 className="font-bold text-lg mb-2">Price Summary</h3>
            
            {isEditMode && (
              <>
                <div className="flex justify-between">
                  <span>Current Membership:</span>
                  <span>${priceSummary.originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Value:</span>
                  <span>${priceSummary.remainingValue.toFixed(2)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span>New Price:</span>
              <span>${priceSummary.newPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
              <span>{isEditMode ? "Amount Due Today:" : "Total Due Today:"}</span>
              <span>${priceSummary.amountCharged.toFixed(2)}</span>
            </div>
            
            {!priceSummary.requiresPayment && isEditMode && (
              <p className="text-green-600 text-sm mt-2">
                No additional payment required for this change.
              </p>
            )}
          </div>
        )}

        {priceSummary && (priceSummary.requiresPayment || !isEditMode) && (
          <div>
            <label className="block">Card Details</label>
            <div className="border p-2 rounded-md">
              <CardElement />
            </div>
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={!stripe || !elements || isProcessing || (priceSummary && !priceSummary.requiresPayment && !isEditMode)}
        >
          {isProcessing ? "Processing..." : isEditMode ? "Confirm Changes" : "Confirm Booking & Pay"}
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