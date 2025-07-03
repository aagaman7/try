import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaRunning, FaHeart } from 'react-icons/fa';

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/view-gym-room-training-sports.jpg" 
          alt="Gym Background" 
          className="w-full h-full object-cover pointer-events-none select-none"
        />
        {/* Deeper black overlay for better text contrast and blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/80 to-black/95"></div>
        {/* Slightly more subtle pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-32 md:pt-40 md:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-none">
              Transform Your Body,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
                Transform Your Life
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-300 font-light">
              Join RBL Fitness and experience the ultimate fitness journey with state-of-the-art facilities and expert guidance.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/membership"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-lg font-bold rounded-lg text-white hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-white text-lg font-bold rounded-lg text-black hover:bg-gray-100 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-4xl font-black text-white">5000+</div>
                <div className="text-gray-400 font-medium">Happy Members</div>
              </div>
              <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-4xl font-black text-white">20+</div>
                <div className="text-gray-400 font-medium">Fitness Programs</div>
              </div>
              <div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-4xl font-black text-white">15+</div>
                <div className="text-gray-400 font-medium">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;