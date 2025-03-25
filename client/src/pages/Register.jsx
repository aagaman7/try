

import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;

