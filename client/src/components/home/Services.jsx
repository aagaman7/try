import React from 'react';
import ServiceCard from '../common/ServiceCard';

const servicesData = [
  {
    id: 1,
    title: 'Strength Training',
    description: 'Build muscle, increase strength, and improve your overall fitness with our comprehensive strength training programs.',
    icon: 'dumbbell',
  },
  {
    id: 2,
    title: 'Cardio Fitness',
    description: 'Improve your heart health and endurance with our variety of cardio equipment and high-energy classes.',
    icon: 'heart',
  },
  {
    id: 3,
    title: 'Personal Training',
    description: 'Get personalized attention and custom workout plans from our certified personal trainers.',
    icon: 'user',
  },
  {
    id: 4,
    title: 'Yoga Classes',
    description: 'Find balance, flexibility, and inner peace with our range of yoga classes for all skill levels.',
    icon: 'yoga',
  },
  {
    id: 5,
    title: 'Nutrition Consulting',
    description: 'Fuel your workouts and recover properly with expert nutrition guidance tailored to your goals.',
    icon: 'apple',
  },
  {
    id: 6,
    title: 'Group Classes',
    description: 'Stay motivated and have fun with our high-energy group fitness classes led by expert instructors.',
    icon: 'users',
  },
];

const Services = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            We offer a wide range of fitness services to help you reach your goals.
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;