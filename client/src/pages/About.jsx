import React from 'react';
import TeamMember from '../components/about/TeamMember';
import StorySection from '../components/about/StorySection';
import { Link } from 'react-router-dom';
// import { motion } from 'react-motion'; // This is optional - you'd need to install this package
import { motion } from "framer-motion";


const About = () => {
  const aboutSections = [
    {
      id: 'our-story',
      title: 'Our Story',
      content: `FitLife Gym was founded in 2010 with a simple mission: to create a fitness community that supports and inspires every member to achieve their personal best. What started as a small local gym has grown into a premier fitness destination, but our commitment to personalized service and member success remains unchanged.
      
      Our journey began when our founder, Michael Torres, a certified personal trainer and fitness enthusiast, recognized that many gyms were missing the human element that makes fitness transformative. He envisioned a place where state-of-the-art equipment meets genuine support and community.
      
      Today, FitLife Gym continues to evolve and grow, but we still maintain the personalized approach and community spirit that set us apart from the beginning. Each member matters, and each fitness journey is unique and important to us.`,
      image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      imageAlt: 'FitLife Gym early days',
    },
    {
      id: 'our-mission',
      title: 'Our Mission',
      content: `At FitLife Gym, our mission is to empower individuals to transform their lives through fitness in a supportive, non-intimidating environment. We believe fitness is for everyone, regardless of age, experience, or current fitness level.
      
      We strive to:
      • Provide a welcoming environment where all members feel comfortable and supported
      • Offer expert guidance that helps members achieve sustainable results
      • Foster a community that motivates and inspires
      • Continuously evolve our facilities and programs to reflect the latest in fitness science
      • Make fitness an enjoyable and rewarding part of our members' daily lives
      
      We measure our success not by the number of members we have, but by the transformations we help facilitate and the fitness goals we help our members achieve.`,
      image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      imageAlt: 'Personal trainer helping a member',
    },
    {
      id: 'our-values',
      title: 'Our Values',
      content: `Our core values guide everything we do at FitLife Gym:
      
      • **Inclusivity**: We welcome everyone, creating a space where diversity is celebrated and all fitness journeys are respected.
      
      • **Excellence**: We commit to excellence in our facilities, programs, and customer service, never settling for less than the best.
      
      • **Authenticity**: We believe in being real with our members about what works, what doesn't, and what it takes to achieve lasting results.
      
      • **Community**: We foster connections among our members, creating a supportive network that elevates everyone's fitness experience.
      
      • **Innovation**: We continuously explore new approaches to fitness, incorporating evidence-based practices that deliver results.`,
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      imageAlt: 'Group fitness class at FitLife Gym',
    },
    {
      id: 'our-approach',
      title: 'Our Approach',
      content: `What sets FitLife Gym apart is our holistic approach to fitness. We understand that true wellness encompasses physical strength, mental resilience, and lifestyle balance.
      
      Each member receives a personalized fitness assessment and customized plan based on their goals, current fitness level, and preferences. Our certified trainers provide ongoing guidance and adjustments to ensure continued progress.
      
      We offer a diverse range of workout options—from high-intensity interval training and strength conditioning to yoga and mobility work—allowing members to build a balanced fitness regimen that works for their unique needs.
      
      Beyond workouts, we provide nutrition guidance, recovery resources, and wellness education to support complete health transformations. At FitLife, we're not just building stronger bodies; we're fostering healthier, happier lives.`,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      imageAlt: 'Personal training session at FitLife Gym',
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Michael Torres',
      title: 'Founder & Head Trainer',
      bio: 'With over 15 years of experience in the fitness industry, Michael founded FitLife Gym with the vision of creating a fitness community that prioritizes personalized support and results. His expertise in strength training and nutrition has helped thousands of members transform their lives.',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      certifications: ['NASM Certified Personal Trainer', 'Precision Nutrition Level 2', 'TRX Suspension Training Specialist']
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      title: 'Fitness Director',
      bio: 'Sarah oversees all fitness programming at FitLife Gym, ensuring that our classes and training sessions reflect the latest in exercise science. Her background in kinesiology and passion for functional fitness have been instrumental in developing our signature workout programs.',
      image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      certifications: ['MS in Exercise Science', 'ACE Certified Personal Trainer', 'Functional Patterns Certified Trainer']
    },
    {
      id: 3,
      name: 'David Chen',
      title: 'Nutrition Specialist',
      bio: 'David helps our members optimize their nutrition to support their fitness goals. His evidence-based approach focuses on sustainable dietary changes that complement our training programs, leading to more significant and lasting results.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      certifications: ['Registered Dietitian', 'Sports Nutrition Specialist', 'Precision Nutrition Level 2']
    },
    {
      id: 4,
      name: 'Maya Rodriguez',
      title: 'Group Fitness Manager',
      bio: 'Maya brings energy and expertise to our group fitness program. With experience in everything from HIIT to yoga, she ensures that our class offerings remain diverse, engaging, and effective for members of all fitness levels.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
      certifications: ['AFAA Group Fitness Instructor', 'Yoga Alliance RYT-200', 'Les Mills Certified Instructor']
    }
  ];

  const facilities = [
    {
      name: 'State-of-the-Art Equipment',
      description: 'Our gym features the latest cardio machines, strength training equipment, and functional training tools to support workouts of all types.'
    },
    {
      name: 'Spacious Group Fitness Studios',
      description: 'Purpose-built studios with floating floors, premium sound systems, and all necessary equipment for our diverse class offerings.'
    },
    {
      name: 'Recovery Zone',
      description: 'Dedicated space for stretching, foam rolling, and recovery work, including massage chairs and percussion therapy devices.'
    },
    {
      name: 'Performance Assessment Lab',
      description: 'Where we conduct comprehensive fitness assessments using advanced technology to track progress and optimize training programs.'
    },
    {
      name: 'Member Lounge',
      description: 'A comfortable space to relax before or after workouts, featuring complimentary refreshments and a nutrition bar.'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'James Wilson',
      quote: 'FitLife isn\'t just a gym—it\'s a complete fitness solution. The personalized approach and supportive community have made all the difference in my fitness journey.',
      achievement: 'Lost 45 pounds and completed his first marathon',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 2,
      name: 'Emma Taylor',
      quote: 'The trainers at FitLife genuinely care about your progress. They\'ve helped me build strength I never thought possible while making the process enjoyable.',
      achievement: 'Increased strength by 70% and improved posture after years of back pain',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80'
    }
  ];

  return (
    <div className="about-page">
      <section className="hero-section bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About FitLife Gym</h1>
          <p className="text-xl max-w-3xl">Where fitness meets community and transformation happens daily. Discover the story, people, and philosophy that make us more than just a gym.</p>
        </div>
      </section>

      {/* Story Sections */}
      <div className="container mx-auto px-4 py-16">
        {aboutSections.map((section, index) => (
          <StorySection 
            key={section.id}
            title={section.title}
            content={section.content}
            image={section.image}
            imageAlt={section.imageAlt}
            isReversed={index % 2 !== 0}
            id={section.id}
          />
        ))}
      </div>

      {/* Team Section */}
      <section className="bg-gray-100 py-16" id="our-team">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map(member => (
              <TeamMember
                key={member.id}
                name={member.name}
                title={member.title}
                bio={member.bio}
                image={member.image}
                certifications={member.certifications}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16" id="facilities">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-bold mb-3">{facility.name}</h3>
                <p className="text-gray-700">{facility.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/facilities" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              Take a Virtual Tour
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-16" id="testimonials">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Member Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-24 h-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                />
                <div>
                  <blockquote className="text-gray-700 italic mb-4">"{testimonial.quote}"</blockquote>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-blue-600">{testimonial.achievement}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/testimonials" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              Read More Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join the FitLife community today and experience the difference that personalized training and genuine support can make.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/membership" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              View Membership Options
            </Link>
            <Link to="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              Schedule a Tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;