import React from 'react';

const TeamMember = ({ name, title, bio, image, certifications }) => {
  return (
    <div className="team-member bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-64 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-blue-600 font-medium mb-4">{title}</p>
        <p className="text-gray-700 mb-4">{bio}</p>
        
        {certifications && certifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Certifications</h4>
            <ul className="text-sm text-gray-700">
              {certifications.map((certification, index) => (
                <li key={index} className="mb-1 flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  {certification}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;