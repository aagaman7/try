import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import NewsSection from '../components/home/NewsSection';
import apiService from '../services/apiService';
import { FaDumbbell, FaUsers, FaStar, FaCheck } from 'react-icons/fa';

const Home = () => {
  const [packages, setPackages] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesData = await apiService.getPackages();
        const trainersData = await apiService.getTrainers();
        setPackages(packagesData);
        setTrainers(trainersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#fafafa]">
      <Hero />
      
      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-8 bg-black rounded-lg shadow-xl">
              <FaDumbbell className="w-12 h-12 text-white mb-4" />
              <h3 className="text-4xl font-black text-white">1000+</h3>
              <p className="text-gray-300 font-medium">Active Members</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl">
              <FaUsers className="w-12 h-12 text-white mb-4" />
              <h3 className="text-4xl font-black text-white">50+</h3>
              <p className="text-gray-300 font-medium">Expert Trainers</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-xl">
              <FaStar className="w-12 h-12 text-white mb-4" />
              <h3 className="text-4xl font-black text-white">4.9</h3>
              <p className="text-gray-300 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      <Services />

      {/* Packages Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-black mb-4">
              Membership Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect membership package that fits your fitness journey
            </p>
          </div>

          <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-3">
            {packages.length > 0 ? packages.map((pkg) => (
              <div key={pkg._id} className="bg-white rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                <div className={`p-8 ${
                  pkg.name === 'Premium' ? 'bg-gradient-to-br from-rose-500 to-rose-600' :
                  pkg.name === 'Elite' ? 'bg-black' :
                  'bg-gradient-to-br from-gray-700 to-gray-800'
                }`}>
                  <div className="h-16 w-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <FaDumbbell className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-4">{pkg.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-lg font-normal text-gray-300">NPR</span>
                    <span className="text-4xl font-black text-white mx-2">
                      {pkg.basePrice?.toLocaleString()}
                    </span>
                    <span className="text-gray-300 font-light">/mo</span>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    {pkg.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          pkg.name === 'Premium' ? 'bg-rose-100 text-rose-600' :
                          pkg.name === 'Elite' ? 'bg-black text-white' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <FaCheck className="h-3 w-3" />
                        </div>
                        <span className="ml-3 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/membership"
                    className={`mt-8 block w-full text-center px-6 py-4 rounded-lg text-lg font-bold transition-all duration-300 ${
                      pkg.name === 'Premium' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700' :
                      pkg.name === 'Elite' ? 'bg-black text-white hover:bg-gray-900' :
                      'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    Choose {pkg.name}
                  </Link>
                </div>
              </div>
            )) : (
              // Fallback static packages
              [
                {
                  name: 'Basic Plan',
                  icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
                  color: 'from-blue-500 to-blue-600',
                  features: ['Access to Gym', 'Basic Equipment', '2 Group Classes', 'Locker Access', 'Fitness Assessment']
                },
                {
                  name: 'Premium Plan',
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  color: 'from-indigo-500 to-indigo-600',
                  features: ['Full Gym Access', 'All Equipment', 'Unlimited Classes', '1 PT Session', 'Nutrition Consultation', 'Sauna Access', 'Mobile App Access']
                },
                {
                  name: 'Elite Plan',
                  icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
                  color: 'from-purple-500 to-purple-600',
                  features: ['VIP Access', 'Premium Equipment', 'Unlimited Classes', '3 PT Sessions', 'Nutrition Plan', 'Recovery Sessions', 'Priority Booking', 'Guest Passes']
                }
              ].map((pkg, index) => (
                <div key={index} className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${pkg.color}`}></div>
                  <div className="p-8">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={pkg.icon} />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">{pkg.name}</h3>
                    <ul className="space-y-4 mb-8">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/membership"
                      className="block w-full text-center px-6 py-4 border-2 border-blue-600 text-lg font-semibold rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-black mb-4">
              Meet Our Expert Trainers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Work with the best fitness professionals to achieve your goals
            </p>
          </div>

          <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {trainers.length > 0 ? trainers.map((trainer) => (
              <div key={trainer._id} className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
                <div className="relative h-64">
                  <img
                    className="w-full h-full object-cover"
                    src={trainer.image || `https://randomuser.me/api/portraits/${trainer.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`}
                    alt={trainer.name}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black mb-2">{trainer.name}</h3>
                  <p className="text-gray-600 mb-4">{trainer.specialization}</p>
                  <Link
                    to={`/trainers/${trainer._id}`}
                    className="block w-full text-center px-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition-all duration-300"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )) : (
              // Fallback static trainers
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105">
                  <div className="relative h-64">
                    <img
                      className="w-full h-full object-cover"
                      src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`}
                      alt="Trainer"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {['John Smith', 'Sarah Wilson', 'Mike Johnson', 'Emma Davis'][index]}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {['Strength Training', 'Yoga Expert', 'CrossFit Coach', 'Nutrition Specialist'][index]}
                    </p>
                    <Link
                      to="/trainers"
                      className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <NewsSection />

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white tracking-tight mb-6">
              Ready to transform your fitness journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join RBL Fitness today and start achieving your fitness goals with expert guidance and support.
            </p>
            <div className="flex justify-center">
              <Link
                to="/membership"
                className="inline-flex items-center px-8 py-4 bg-white text-lg font-bold rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
              >
                View Membership Options
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
