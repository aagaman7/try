

import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;



