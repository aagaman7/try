import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          alt="Gym"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Transform Your Body, <br />
          Transform Your Life
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-3xl">
          Welcome to FitLife Gym, where fitness meets lifestyle. Our state-of-the-art facility and expert trainers are here to help you achieve your fitness goals and live your best life.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/membership"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Join Now
          </Link>
          <Link
            to="/about"
            className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;