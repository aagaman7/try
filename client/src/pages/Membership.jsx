import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PricingCard from '../components/membership/PricingCard';
import CustomPackage from '../components/membership/CustomPackage';

const Membership = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomPackage, setShowCustomPackage] = useState(false);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/memberships');
        
        // Transform the data to match the component's expected format
        const formattedPackages = response.data.map((membership, index) => ({
          id: membership._id,
          name: membership.name,
          price: membership.price.monthly,
          period: 'month',
          features: membership.features,
          popular: index === 1, // Set the middle option as popular
          color: getColorForPackage(index),
        }));
        
        setPackages(formattedPackages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError('Failed to load membership options. Please try again later.');
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  // Helper function to assign colors based on package index
  const getColorForPackage = (index) => {
    const colors = ['gray', 'blue', 'indigo'];
    return colors[index % colors.length];
  };

  return (
    <div>
      <div className="relative bg-gray-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Gym interior"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Membership Options
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the membership that fits your lifestyle and fitness goals. All plans include access to our state-of-the-art facilities and expert support.
          </p>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Select Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Find the perfect membership for your fitness journey
            </p>
          </div>

          {loading ? (
            <div className="mt-12 text-center">
              <p className="text-xl text-gray-600">Loading membership options...</p>
            </div>
          ) : error ? (
            <div className="mt-12 text-center">
              <p className="text-xl text-red-600">{error}</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
              {packages.map((pkg) => (
                <PricingCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Looking for something specific?
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Create your own custom package based on your needs
            </p>
            <button
              onClick={() => setShowCustomPackage(!showCustomPackage)}
              className="mt-6 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {showCustomPackage ? 'Hide Custom Package Builder' : 'Build Your Custom Package'}
            </button>
          </div>

          {showCustomPackage && <CustomPackage />}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">Have questions about our memberships? Find answers to common questions below.</p>
          </div>
          <div className="mt-12 space-y-6 divide-y divide-gray-200">
            <div className="pt-6">
              <div className="text-lg">
                <h3 className="font-medium text-gray-900">How long are membership contracts?</h3>
              </div>
              <div className="mt-2 text-base text-gray-500">
                <p>Our standard memberships are month-to-month with no long-term commitment. We also offer discounted rates for 6-month and annual commitments.</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-lg">
                <h3 className="font-medium text-gray-900">Can I freeze my membership temporarily?</h3>
              </div>
              <div className="mt-2 text-base text-gray-500">
                <p>Yes, members can freeze their membership for up to 3 months per year due to medical reasons, travel, or other circumstances. A small administrative fee may apply.</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-lg">
                <h3 className="font-medium text-gray-900">Is there a joining fee?</h3>
              </div>
              <div className="mt-2 text-base text-gray-500">
                <p>There is a one-time initiation fee of $49 for new members. We frequently run promotions where this fee is reduced or waived completely.</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-lg">
                <h3 className="font-medium text-gray-900">Do you offer family discounts?</h3>
              </div>
              <div className="mt-2 text-base text-gray-500">
                <p>Yes, we offer a 10% discount on additional memberships for immediate family members living in the same household.</p>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-lg">
                <h3 className="font-medium text-gray-900">Can I transfer my membership to someone else?</h3>
              </div>
              <div className="mt-2 text-base text-gray-500">
                <p>Membership transfers are considered on a case-by-case basis and may require an administrative fee. Please contact our membership services for more information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start your fitness journey?</span>
            <span className="block text-blue-300">Join today and get your first month at 50% off.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Sign Up Now
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;