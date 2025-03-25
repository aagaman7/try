import React from 'react';
import { useNavigate } from 'react-router-dom';

const PricingCard = ({ pkg }) => {
  const navigate = useNavigate();
  
  const colorClasses = {
    gray: {
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      button: 'bg-gray-800 hover:bg-gray-900',
      highlight: 'text-gray-800',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      highlight: 'text-blue-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      highlight: 'text-indigo-600',
    },
  };

  const colors = colorClasses[pkg.color];
  
  // Map package name to route parameter
  const getPackageType = (name) => {
    const packageMap = {
      'Basic': 'basic',
      'Premium': 'premium',
      'Elite': 'elite',
      'Custom': 'custom'
    };
    return packageMap[name] || name.toLowerCase();
  };

  const handlePackageSelect = () => {
    const packageType = getPackageType(pkg.name);
    navigate(`/package/${packageType}`);
  };

  return (
    <div className={`rounded-lg shadow-lg ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`p-6 ${colors.bg} rounded-t-lg ${colors.border} border-b`}>
        {pkg.popular && (
          <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-blue-200 text-blue-800 mb-4">
            Most Popular
          </span>
        )}
        <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900">${pkg.price}</span>
          <span className="ml-1 text-xl font-medium text-gray-500">/{pkg.period}</span>
        </div>
      </div>
      <div className="p-6 bg-white rounded-b-lg">
        <ul className="space-y-4">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className={`flex-shrink-0 h-6 w-6 ${colors.highlight}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-3 text-base text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handlePackageSelect}
          className={`block w-full px-4 py-3 text-center rounded-md shadow ${colors.button} text-white font-medium mt-8`}
        >
          Choose {pkg.name}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;