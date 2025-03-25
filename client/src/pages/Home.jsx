import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to transform your fitness journey?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join FitLife Gym today and start achieving your fitness goals.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/membership"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                View Membership Options
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
    </div>
  );
};

export default Home;
