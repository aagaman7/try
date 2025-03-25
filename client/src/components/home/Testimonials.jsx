import React from 'react';

const testimonials = [
  {
    id: 1,
    content: "FitLife Gym completely transformed my fitness journey. The trainers are knowledgeable and supportive, and the facility has everything I need.",
    author: "Sarah Johnson",
    role: "Member since 2021",
    image: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    id: 2,
    content: "I've been to many gyms over the years, but none compare to FitLife. The community atmosphere and quality equipment make every workout enjoyable.",
    author: "Michael Chen",
    role: "Member since 2020",
    image: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    id: 3,
    content: "The personal training program at FitLife helped me reach goals I never thought possible. I'm stronger and healthier than I've ever been!",
    author: "Emma Rodriguez",
    role: "Member since 2022",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Members Say
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Don't just take our word for it - hear from our satisfied members.
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={testimonial.image}
                  alt={testimonial.author}
                />
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">&ldquo;{testimonial.content}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;