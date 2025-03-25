import React from 'react';

const StorySection = ({ title, content, image, imageAlt, isReversed, id }) => {
  return (
    <div className="story-section py-12 border-b border-gray-200 last:border-b-0" id={id}>
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-center`}>
        {/* Image Column */}
        <div className="w-full lg:w-1/2">
          <img 
            src={image} 
            alt={imageAlt} 
            className="rounded-lg shadow-md w-full h-auto object-cover"
          />
        </div>
        
        {/* Content Column */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <div className="prose prose-lg max-w-none">
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySection;