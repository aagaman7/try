import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  // Size variants for the spinner
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };
  
  // Get the appropriate size class or default to medium
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <div className={`${spinnerSize} border-t-blue-500 border-r-blue-500 border-b-blue-200 border-l-blue-200 rounded-full animate-spin`}></div>
      {message && (
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;