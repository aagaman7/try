import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

// Icons
import { 
  Dumbbell, 
  Heart, 
  User, 
  Users, 
  Calendar, 
  Goal, 
  ClipboardList, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Clock,
  Star
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ToastMessage = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'}`}>
      <div className="mr-3">
        {type === 'success' ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
      </div>
      <div className="text-sm font-medium text-gray-800">
        {message}
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <XCircle size={16} />
      </button>
    </div>
  );
};

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [step, setStep] = useState(1);

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

  const handleNextStep = async (e) => {
    e.preventDefault();
    try {
      const bookingResponse = await apiService.createBooking(formData);
      setClientSecret(bookingResponse.clientSecret);
      setShowPaymentModal(true);
    } catch (err) {
      // Show backend error message (e.g., active membership restriction)
      setError(err.message || (err.response && err.response.data && err.response.data.message) || "Failed to process booking.");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      setSuccess("Booking and payment successful!");
      setShowPaymentModal(false);
      
      // Reset form
      setFormData({
        packageId: '',
        customServices: [],
        timeSlot: '',
        workoutDaysPerWeek: '',
        goals: '',
        paymentInterval: 'Monthly'
      });
      
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock data for packages and services
  const mockPackages = [
    { _id: '1', name: 'Basic Fitness', basePrice: 49.99 },
    { _id: '2', name: 'Premium Access', basePrice: 89.99 },
    { _id: '3', name: 'Elite Membership', basePrice: 129.99 }
  ];

  const mockServices = [
    { _id: '1', name: 'Personal Training Session', price: 40, description: 'One-on-one training with certified fitness experts', icon: 'User' },
    { _id: '2', name: 'Nutrition Consultation', price: 35, description: 'Personalized diet planning and nutritional guidance', icon: 'Utensils' },
    { _id: '3', name: 'Body Composition Analysis', price: 20, description: 'Detailed body measurements and composition tracking', icon: 'Activity' },
    { _id: '4', name: 'Recovery Massage', price: 50, description: 'Professional sports massage therapy', icon: 'Heart' }
  ];

  // Use mock data if API call hasn't returned results yet
  const displayPackages = packages.length > 0 ? packages : mockPackages;
  const displayServices = services.length > 0 ? services : mockServices;

  const renderCardIcon = (packageName) => {
    if (packageName.toLowerCase().includes('basic')) return <Star className="text-blue-500" />;
    if (packageName.toLowerCase().includes('premium')) return <Star className="text-purple-500" />;
    if (packageName.toLowerCase().includes('elite')) return <Star className="text-yellow-500" />;
    return <Star className="text-blue-500" />;
  };

  const closeToast = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    
    <div className="max-w-4xl mx-auto p-8">
      {success && <ToastMessage message={success} type="success" onClose={closeToast} />}
      {error && <ToastMessage message={error} type="error" onClose={closeToast} />}
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
          <h2 className="text-3xl font-bold flex items-center tracking-tight">
            <ClipboardList className="mr-3" size={28} />
            Book Your Fitness Membership
          </h2>
          <p className="mt-2 text-indigo-100 text-lg">Join RBL Fitness and start your fitness journey today</p>
        </div>

        <form onSubmit={handleNextStep} className="p-8">
          <div className="flex justify-between mb-8">
            <div className={`flex-1 p-2 text-center ${step === 1 ? 'border-b-2 border-indigo-500 text-indigo-600 font-semibold' : 'text-slate-500'}`}>
              1. Select Package
            </div>
            <div className={`flex-1 p-2 text-center ${step === 2 ? 'border-b-2 border-indigo-500 text-indigo-600 font-semibold' : 'text-slate-500'}`}>
              2. Payment
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-slate-700 font-medium mb-3 flex items-center">
                <Dumbbell className="mr-2" size={20} />
                Choose Your Package
              </label>
              <div className="grid gap-4">
                {displayPackages.map(pkg => (
                  <label key={pkg._id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${formData.packageId === pkg._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="packageId"
                      value={pkg._id}
                      checked={formData.packageId === pkg._id}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        {renderCardIcon(pkg.name)}
                        <span className="ml-2 font-medium text-slate-800">{pkg.name}</span>
                      </div>
                      <div className="text-indigo-600 font-semibold mt-1">${pkg.basePrice}/month</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-3 flex items-center">
                <Calendar className="mr-2" size={20} />
                Choose Time Slot
              </label>
              <div className="relative mb-6">
                <Clock className="absolute top-3 left-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  name="timeSlot" 
                  value={formData.timeSlot} 
                  onChange={handleChange} 
                  placeholder="e.g. Weekdays 6-8 PM" 
                  required 
                  className="w-full pl-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <label className="block text-slate-700 font-medium mb-3 flex items-center">
                <Calendar className="mr-2" size={20} />
                Workout Days Per Week
              </label>
              <select 
                name="workoutDaysPerWeek" 
                value={formData.workoutDaysPerWeek} 
                onChange={handleChange} 
                required 
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6"
              >
                <option value="">Select days per week</option>
                <option value="1">1 day/week</option>
                <option value="2">2 days/week</option>
                <option value="3">3 days/week</option>
                <option value="4">4 days/week</option>
                <option value="5">5 days/week</option>
                <option value="6">6 days/week</option>
                <option value="7">7 days/week</option>
              </select>

              <label className="block text-slate-700 font-medium mb-3 flex items-center">
                <Goal className="mr-2" size={20} />
                Your Fitness Goals
              </label>
              <textarea 
                name="goals" 
                value={formData.goals} 
                onChange={handleChange} 
                placeholder="Tell us about your fitness goals..." 
                required 
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-slate-700 font-medium mb-3 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Payment Interval
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Monthly', '3 Months', 'Yearly'].map((interval) => (
                <label key={interval} className={`p-4 border rounded-xl text-center cursor-pointer transition-all duration-300 ${
                  formData.paymentInterval === interval 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentInterval"
                    value={interval}
                    checked={formData.paymentInterval === interval}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {interval}
                  {interval === 'Yearly' && <span className="block text-sm text-emerald-500 mt-1">Save 15%</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-slate-800">
              <Users className="mr-2" size={20} />
              Additional Services
              <span className="ml-2 text-sm font-normal text-slate-600">(Select any services you'd like to add)</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {displayServices.map(service => (
                <label key={service._id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                  formData.customServices.includes(service._id) 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-200'
                }`}>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      value={service._id}
                      onChange={handleChange}
                      checked={formData.customServices.includes(service._id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">{service.name}</span>
                        <span className="text-indigo-600 font-semibold">${service.price}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{service.description || 'Additional fitness service'}</p>
                    </div>
                  </div>
                  {formData.customServices.includes(service._id) && (
                    <div className="mt-2 text-sm text-emerald-500 flex items-center">
                      <CheckCircle className="inline-block mr-1" size={16} /> Added to your package
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
            >
              <CreditCard className="mr-2" size={20} />
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <CreditCard className="mr-2" size={24} />
                Payment Details
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Complete your membership booking with a secure payment</p>
              <div className="border border-gray-300 p-4 rounded-lg mb-4">
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
            </div>
            
            <button
              onClick={handlePayment}
              disabled={!stripe || isProcessing}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      )}
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