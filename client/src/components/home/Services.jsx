import React from 'react';
import { FaDumbbell, FaRunning, FaHeartbeat, FaUsers, FaAppleAlt, FaSwimmer } from 'react-icons/fa';

const Services = () => {
  const services = [
    {
      icon: <FaDumbbell className="w-8 h-8" />,
      title: 'Strength Training',
      description: 'Build muscle and increase strength with our comprehensive weight training programs.'
    },
    {
      icon: <FaRunning className="w-8 h-8" />,
      title: 'Cardio Classes',
      description: 'Improve your endurance and burn calories with our high-energy cardio sessions.'
    },
    {
      icon: <FaHeartbeat className="w-8 h-8" />,
      title: 'Personal Training',
      description: 'Get personalized attention and achieve your goals faster with our expert trainers.'
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Group Classes',
      description: 'Join our motivating group sessions for a fun and effective workout experience.'
    },
    {
      icon: <FaAppleAlt className="w-8 h-8" />,
      title: 'Nutrition Planning',
      description: 'Receive expert guidance on nutrition to complement your fitness journey.'
    },
    {
      icon: <FaSwimmer className="w-8 h-8" />,
      title: 'Swimming Pool',
      description: 'Access our Olympic-sized pool for swimming and aqua fitness classes.'
    }
  ];

  return (
    <section className="py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-black mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive fitness solutions tailored to your needs
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center mb-6">
                <div className="p-4 bg-black rounded-lg text-white">
                  {service.icon}
                </div>
                <h3 className="ml-4 text-xl font-bold text-black">
                  {service.title}
                </h3>
              </div>
              <p className="text-gray-600 text-lg">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;