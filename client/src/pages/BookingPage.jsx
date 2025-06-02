import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPackage = location.state?.selectedPackage;

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({
    packageId: selectedPackage?._id || '',
    customServices: [],
    timeSlot: '',
    workoutDaysPerWeek: '',
    goals: '',
    paymentInterval: 'Monthly'
  });
  const [totalPrice, setTotalPrice] = useState({
    basePrice: selectedPackage?.basePrice || 0,
    servicesPrice: 0,
    total: selectedPackage?.basePrice || 0
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
        const disc = await apiService.getAllDiscounts({ active: true });
        setPackages(pkg);
        setServices(serv);
        setDiscounts(disc);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  // Calculate total price whenever formData changes
  useEffect(() => {
    const selectedPkg = packages.find(p => p._id === formData.packageId) || selectedPackage;
    const basePrice = selectedPkg?.basePrice || 0;
    
    // Calculate services price
    const servicesPrice = formData.customServices.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service?.price || 0);
    }, 0);

    // Find applicable discount for the payment interval
    const applicableDiscount = discounts.find(d => d.paymentInterval === formData.paymentInterval);
    
    // Calculate interval multiplier
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    // Apply payment interval and discount
    let finalBasePrice = basePrice * intervalMultiplier[formData.paymentInterval];
    if (applicableDiscount) {
      finalBasePrice *= (1 - (applicableDiscount.percentage / 100));
    }

    setTotalPrice({
      basePrice: finalBasePrice,
      servicesPrice,
      total: finalBasePrice + servicesPrice
    });
  }, [formData, packages, services, selectedPackage, discounts]);

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

  // Filter out services that are included in the selected package
  const getAvailableServices = () => {
    const selectedPkg = packages.find(p => p._id === formData.packageId) || selectedPackage;
    const includedServiceIds = selectedPkg?.includedServices?.map(s => s._id) || [];
    return services.filter(service => !includedServiceIds.includes(service._id));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
    toast.info('Please complete your payment', {
      icon: '💳',
      style: {
        background: '#EFF6FF',
        color: '#1E40AF',
        borderLeft: '4px solid #3B82F6'
      }
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // First create a payment intent
      const paymentIntentResponse = await apiService.createPaymentIntent({
        amount: Math.round(totalPrice.total * 100), // Convert to smallest currency unit (paisa)
        currency: 'npr',
        metadata: {
          packageName: selectedPackage?.name,
          timeSlot: formData.timeSlot,
          paymentInterval: formData.paymentInterval
        }
      });

      if (!paymentIntentResponse?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm the card payment
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(paymentIntentResponse.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: selectedPackage?.name
          }
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // After successful payment, create the booking
      const bookingResponse = await apiService.createBooking({
        ...formData,
        paymentIntentId: paymentResult.paymentIntent.id,
        amount: totalPrice.total,
        status: 'confirmed'
      });

      if (!bookingResponse) {
        throw new Error('Failed to create booking');
      }

      toast.success('Booking and payment successful! Redirecting to dashboard...', {
        icon: '✅',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          borderLeft: '4px solid #22C55E'
        }
      });

      setSuccess('Booking and payment successful!');
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

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.', {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
      setError(err.message || 'Payment failed.');
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
    <>
      <div className="max-w-4xl mx-auto p-8">
        {success && <ToastMessage message={success} type="success" onClose={closeToast} />}
        {error && <ToastMessage message={error} type="error" onClose={closeToast} />}
        
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-black to-gray-900 p-8 text-white border-b border-white/10">
            <h2 className="text-3xl font-black flex items-center tracking-tight">
              <ClipboardList className="mr-3 text-rose-500" size={28} />
              Book Your Fitness Membership
            </h2>
            <p className="mt-2 text-gray-400 text-lg">Join RBL Fitness and start your fitness journey today</p>
          </div>

          <form onSubmit={handleNextStep} className="p-8 bg-[#fafafa]">
            <div className="flex justify-between mb-8">
              <div className={`flex-1 p-2 text-center ${step === 1 ? 'border-b-2 border-rose-500 text-rose-600 font-bold' : 'text-gray-500'}`}>
                1. Select Package
              </div>
              <div className={`flex-1 p-2 text-center ${step === 2 ? 'border-b-2 border-rose-500 text-rose-600 font-bold' : 'text-gray-500'}`}>
                2. Payment
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 font-bold mb-3 flex items-center">
                  <Dumbbell className="mr-2 text-rose-500" size={20} />
                  Selected Package
                </label>
                <div className="p-4 border rounded-xl bg-black/5 border-black/10">
                  <h3 className="font-bold text-gray-900">{selectedPackage?.name}</h3>
                  <p className="text-rose-600 font-bold mt-1">Nrs {totalPrice.basePrice.toFixed(2)}</p>
                  {selectedPackage?.includedServices?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-bold text-gray-900">Included Services:</p>
                      <ul className="mt-1 text-sm text-gray-700">
                        {selectedPackage.includedServices.map(service => (
                          <li key={service._id} className="flex items-center">
                            <CheckCircle className="mr-1 text-rose-500" size={14} />
                            {service.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-3 flex items-center">
                  <Calendar className="mr-2 text-rose-500" size={20} />
                  Choose Time Slot
                </label>
                <div className="relative mb-6">
                  <Clock className="absolute top-3 left-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="timeSlot" 
                    value={formData.timeSlot} 
                    onChange={handleChange} 
                    placeholder="e.g. Weekdays 6-8 PM" 
                    required 
                    className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <label className="block text-gray-700 font-bold mb-3 flex items-center">
                  <Calendar className="mr-2 text-rose-500" size={20} />
                  Workout Days Per Week
                </label>
                <select 
                  name="workoutDaysPerWeek" 
                  value={formData.workoutDaysPerWeek} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 mb-6"
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

                <label className="block text-gray-700 font-bold mb-3 flex items-center">
                  <Goal className="mr-2 text-rose-500" size={20} />
                  Your Fitness Goals
                </label>
                <textarea 
                  name="goals" 
                  value={formData.goals} 
                  onChange={handleChange} 
                  placeholder="Tell us about your fitness goals..." 
                  required 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 h-32"
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-gray-700 font-bold mb-3 flex items-center">
                <CreditCard className="mr-2 text-rose-500" size={20} />
                Payment Interval
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['Monthly', '3 Months', 'Yearly'].map((interval) => {
                  const discount = discounts.find(d => d.paymentInterval === interval);
                  return (
                    <label key={interval} className={`p-4 border rounded-xl text-center cursor-pointer transition-all duration-300 ${
                      formData.paymentInterval === interval 
                        ? 'border-rose-500 bg-rose-50 text-rose-600' 
                        : 'border-gray-200 hover:border-rose-300'
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
                      {discount && (
                        <span className="block text-sm text-emerald-500 mt-1">Save {discount.percentage}%</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Users className="mr-2 text-rose-500" size={20} />
                Additional Services
                <span className="ml-2 text-sm font-normal text-gray-600">(Select any services you'd like to add)</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {getAvailableServices().map(service => (
                  <label key={service._id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                    formData.customServices.includes(service._id) 
                      ? 'border-rose-500 bg-rose-50' 
                      : 'border-gray-200'
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
                          <span className="font-bold text-gray-800">{service.name}</span>
                          <span className="text-rose-600 font-bold">Nrs {service.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description || 'Additional fitness service'}</p>
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

            {/* Price Summary */}
            <div className="mt-8 bg-black p-6 rounded-xl text-white">
              <h3 className="text-lg font-bold mb-4">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Base Package ({formData.paymentInterval})</span>
                  <span>Nrs {totalPrice.basePrice.toFixed(2)}</span>
                </div>
                {totalPrice.servicesPrice > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Additional Services</span>
                    <span>Nrs {totalPrice.servicesPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span className="text-rose-500">Nrs {totalPrice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                type="submit"
                className="bg-black text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
              >
                <CreditCard className="mr-2 text-rose-500" size={20} />
                Proceed to Payment
              </button>
            </div>
          </form>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-2xl w-full z-10 mx-4 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black flex items-center text-gray-800">
                  <CreditCard className="mr-3 text-rose-500" size={28} />
                  Complete Payment
                </h3>
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-black/90 backdrop-blur-sm text-white p-6 rounded-xl">
                  <h4 className="text-lg font-bold mb-4">Order Summary</h4>
                  
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-white/10">
                      <h5 className="font-medium text-gray-300">Selected Package</h5>
                      <p className="text-lg font-bold text-rose-500">{selectedPackage?.name}</p>
                      <p className="text-gray-300">Nrs {totalPrice.basePrice.toFixed(2)}</p>
                    </div>

                    {formData.customServices.length > 0 && (
                      <div className="pb-4 border-b border-white/10">
                        <h5 className="font-medium text-gray-300">Additional Services</h5>
                        {formData.customServices.map(serviceId => {
                          const service = services.find(s => s._id === serviceId);
                          return (
                            <div key={serviceId} className="flex justify-between mt-2">
                              <span className="text-gray-300">{service?.name}</span>
                              <span className="text-white">Nrs {service?.price.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pb-4 border-b border-white/10">
                      <h5 className="font-medium text-gray-300">Payment Details</h5>
                      <p className="text-gray-300">Interval: {formData.paymentInterval}</p>
                      <p className="text-gray-300">Time Slot: {formData.timeSlot}</p>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total Amount</span>
                        <span className="text-xl font-black text-rose-500">Nrs {totalPrice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Card Details</h4>
                  <div className="bg-white border border-gray-200 p-6 rounded-xl mb-6 shadow-sm">
                    <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#1f2937',
                            '::placeholder': {
                              color: '#6b7280',
                            },
                          },
                          invalid: {
                            color: '#dc2626',
                          },
                        },
                      }}
                    />
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={!stripe || isProcessing}
                    className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 text-rose-500" size={20} />
                        Pay Nrs {totalPrice.total.toFixed(2)}
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Your payment is secured by Stripe. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
        toastStyle={{
          borderRadius: '12px',
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          padding: '12px 24px',
          margin: '8px'
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #f43f5e, #fb7185)'
        }}
      />
    </>
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