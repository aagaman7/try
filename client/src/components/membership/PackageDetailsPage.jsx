import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const PackageDetailsPage = () => {
  const { packageType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentOption, setPaymentOption] = useState('1month');
  const [loading, setLoading] = useState(false);
  const [customPackageData, setCustomPackageData] = useState(null);
  const [packageDetails, setPackageDetails] = useState({});
  
  useEffect(() => {
    // Fetch membership details from backend
    const fetchMemberships = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/memberships');
        const memberships = response.data;
        
        // Transform backend data into the format needed for UI
        const transformedPackages = {};
        
        memberships.forEach(membership => {
          transformedPackages[membership.type] = {
            name: membership.name,
            price: {
              '1month': membership.price.monthly,
              '3month': membership.price.quarterly,
              '1year': membership.price.annual
            },
            features: membership.features,
            color: getColorForPackage(membership.type)
          };
        });
        
        setPackageDetails(transformedPackages);
      } catch (error) {
        console.error('Error fetching memberships:', error);
        // Use fallback data if API fails
        setPackageDetails(getFallbackPackageDetails());
      }
    };
    
    fetchMemberships();
    
    // Check if we have custom package data in location state
    if (location.state && location.state.customPackage) {
      setCustomPackageData(location.state.customPackage);
    }
  }, [location]);
  
  // Helper function to get color class based on package type
  const getColorForPackage = (type) => {
    const colorMap = {
      'basic': 'bg-blue-500',
      'premium': 'bg-purple-500',
      'elite': 'bg-amber-500',
      'custom': 'bg-green-500'
    };
    return colorMap[type] || 'bg-blue-500';
  };
  
  // Fallback package details in case API fails
  const getFallbackPackageDetails = () => ({
    basic: {
      name: 'Basic Membership',
      price: {
        '1month': 29.99,
        '3month': 79.99,
        '1year': 299.99
      },
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Open 6am - 10pm',
        'Fitness assessment'
      ],
      color: 'bg-blue-500'
    },
    premium: {
      name: 'Premium Membership',
      price: {
        '1month': 49.99,
        '3month': 129.99,
        '1year': 499.99
      },
      features: [
        'All Basic features',
        'Group fitness classes',
        'Personal trainer (1 session/month)',
        'Nutritional guidance',
        'Guest passes (2/month)'
      ],
      color: 'bg-purple-500'
    },
    elite: {
      name: 'Elite Membership',
      price: {
        '1month': 79.99,
        '3month': 199.99,
        '1year': 799.99
      },
      features: [
        'All Premium features',
        'Personal trainer (4 sessions/month)',
        'Spa access',
        'Massage therapy (1/month)',
        'Priority class booking',
        '24/7 gym access'
      ],
      color: 'bg-amber-500'
    },
    custom: {
      name: 'Custom Membership',
      price: {
        '1month': 59.99,
        '3month': 159.99,
        '1year': 599.99
      },
      features: [
        'Customized workout plan',
        'Selected amenities access',
        'Flexible scheduling',
        'Pay only for what you need'
      ],
      color: 'bg-green-500'
    }
  });

  // Set up custom package information if available
  useEffect(() => {
    if (packageType === 'custom' && customPackageData) {
      setPackageDetails(prevDetails => ({
        ...prevDetails,
        custom: {
          ...prevDetails.custom,
          name: customPackageData.name,
          features: customPackageData.features,
          price: {
            '1month': customPackageData.price,
            '3month': customPackageData.price * 2.7, // 10% discount
            '1year': customPackageData.price * 10.2  // 15% discount
          }
        }
      }));
    }
  }, [customPackageData, packageType]);

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM'
  ];

  const selectedPackage = packageDetails[packageType] || (packageDetails.basic || {});
  
  const discountMessage = {
    '1month': 'Standard rate',
    '3month': 'Save 10% with quarterly plan',
    '1year': 'Save 15% with annual plan'
  };
  
  // Generate booking reference
  const generateBookingReference = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `GYM-${randomNum}`;
  };
  
  // Calculate start and end dates based on payment option
  const calculateDates = () => {
    const startDate = new Date();
    const endDate = new Date();
    
    if (paymentOption === '1month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (paymentOption === '3month') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (paymentOption === '1year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return { startDate, endDate };
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedTime) {
      alert('Please select a preferred time slot');
      return;
    }
    
    setLoading(true);
    
    // Calculate dates
    const { startDate, endDate } = calculateDates();
    
    // Create booking data matching the backend model
    const bookingData = {
      packageType: packageType,
      preferredTime: selectedTime,
      paymentOption: paymentOption,
      amount: selectedPackage.price[paymentOption],
      paymentStatus: 'pending',
      bookingReference: generateBookingReference(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true
    };
    
    // If this is a custom package, add the customPackageId
    if (packageType === 'custom' && customPackageData && customPackageData.customPackageData) {
      // In a real application, we would first save the custom package to the backend
      // and then use the returned ID
      // bookingData.customPackageId = savedCustomPackage._id;
      
      // For now, we'll include the custom package data for demonstration
      bookingData.customPackageDetails = customPackageData.customPackageData;
    }
    
    // In a real implementation, we would save the booking data to the backend
    try {
      // Simulating API call
      // const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
      
      setTimeout(() => {
        setLoading(false);
        // Navigate to confirmation page
        navigate('/booking-confirmation', { 
          state: { 
            package: selectedPackage,
            type: packageType,
            time: selectedTime,
            payment: paymentOption,
            amount: selectedPackage.price[paymentOption],
            bookingReference: bookingData.bookingReference,
            startDate: startDate,
            endDate: endDate
          } 
        });
      }, 1500);
    } catch (error) {
      console.error('Error creating booking:', error);
      setLoading(false);
      alert('There was an error processing your booking. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
          onClick={() => navigate('/membership')}
        >
          <ChevronLeft size={20} />
          <span>Back to Memberships</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`${selectedPackage.color} p-6 text-white`}>
            <h1 className="text-3xl font-bold">{selectedPackage.name}</h1>
            <p className="text-lg opacity-90">Complete your membership selection</p>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Package Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Selected Plan:</span>
                  <span>{selectedPackage.name}</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Features:</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    {selectedPackage.features && selectedPackage.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                <CalendarDays className="inline mr-2" size={20} />
                Select Preferred Time
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`p-3 rounded-md border text-sm transition-colors ${
                      selectedTime === time 
                        ? `${selectedPackage.color} text-white border-transparent` 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {selectedTime && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected time: <span className="font-medium">{selectedTime}</span>
                </p>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                <CreditCard className="inline mr-2" size={20} />
                Payment Options
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  {Object.keys(selectedPackage.price || {}).map((option) => {
                    const displayName = option === '1month' ? 'Monthly' : 
                                        option === '3month' ? 'Quarterly' : 'Annual';
                    return (
                      <div key={option} className="flex items-center">
                        <input
                          type="radio"
                          id={option}
                          name="paymentOption"
                          className="h-5 w-5 text-blue-600"
                          checked={paymentOption === option}
                          onChange={() => setPaymentOption(option)}
                        />
                        <label htmlFor={option} className="ml-3 flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium">{displayName}</span>
                              <p className="text-sm text-gray-500">{discountMessage[option]}</p>
                            </div>
                            <span className="font-bold">${selectedPackage.price[option].toFixed(2)}</span>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Amount:</p>
                <p className="text-2xl font-bold">${selectedPackage.price[paymentOption].toFixed(2)}</p>
              </div>
              <button
                className={`${selectedPackage.color} text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsPage;