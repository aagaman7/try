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
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-6">
              Ready to transform your fitness journey?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Join RBL Fitness today and start achieving your fitness goals with expert guidance and support.
            </p>
            <div className="flex justify-center">
              <Link
                to="/membership"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl"
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
