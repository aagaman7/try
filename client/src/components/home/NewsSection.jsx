import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaNewspaper, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using NewsAPI - you'll need to replace 'YOUR_API_KEY' with an actual API key
        const response = await axios.get(
          'https://newsapi.org/v2/everything', {
            params: {
              q: '(fitness OR "gym workout" OR "exercise training" OR "bodybuilding" OR "weight training" OR "personal training") AND (health OR wellness OR workout)',
              domains: 'bodybuilding.com,menshealth.com,womenshealthmag.com,shape.com,acefitness.org,healthline.com,muscleandstrength.com,stack.com',
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: 6,
              apiKey: '413e01d353f84893a4cddcd18c0e0541'
            }
          }
        );

        if (response.data.articles) {
          setNews(response.data.articles);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
        
        // Fallback data in case API fails
        setNews([
          {
            title: "New Study Shows Benefits of High-Intensity Interval Training",
            description: "Research reveals that short bursts of intense exercise can be more effective than longer, moderate workouts for improving cardiovascular health and burning fat.",
            urlToImage: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.healthline.com/health/fitness/high-intensity-interval-training",
            publishedAt: "2024-02-20T08:00:00Z",
            source: { name: "Healthline" }
          },
          {
            title: "The Rise of Mind-Body Fitness Programs",
            description: "How combining mental wellness with physical exercise is becoming the new trend in fitness, with programs integrating meditation and mindfulness into workouts.",
            urlToImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.mindbodygreen.com/articles/mind-body-fitness",
            publishedAt: "2024-02-19T10:30:00Z",
            source: { name: "MindBodyGreen" }
          },
          {
            title: "Nutrition Trends: The Impact of Diet on Exercise Performance",
            description: "Expert nutritionists discuss how different dietary approaches can affect your workout results and overall fitness goals.",
            urlToImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.nutritioninsight.com/diet-and-exercise",
            publishedAt: "2024-02-18T09:15:00Z",
            source: { name: "Nutrition Insight" }
          },
          {
            title: "Technology's Role in Modern Fitness Training",
            description: "How AI and wearable technology are revolutionizing personal training and workout tracking for better results.",
            urlToImage: "https://images.unsplash.com/photo-1510017803434-a899398421b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.techinfitness.com/ai-workout-tracking",
            publishedAt: "2024-02-17T14:20:00Z",
            source: { name: "Tech in Fitness" }
          },
          {
            title: "Recovery Techniques for Better Athletic Performance",
            description: "Latest research on recovery methods that help athletes and fitness enthusiasts optimize their training and prevent injuries.",
            urlToImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.sportsmed.com/recovery-methods",
            publishedAt: "2024-02-16T11:45:00Z",
            source: { name: "Sports Medicine" }
          },
          {
            title: "Sustainable Fitness: Eco-Friendly Workout Trends",
            description: "How the fitness industry is adapting to environmental concerns with sustainable equipment and green gym practices.",
            urlToImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            url: "https://www.ecofitness.com/sustainable-workouts",
            publishedAt: "2024-02-15T16:30:00Z",
            source: { name: "Eco Fitness" }
          }
        ]);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-64 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-black mb-4">
            Latest News & Tips
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest fitness trends and expert advice
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <article 
              key={index}
              className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.urlToImage || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg">
                    {item.source.name}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{formatDate(item.publishedAt)}</span>
                  <Link
                    to="/blog"
                    className="text-black font-bold hover:text-gray-700 transition-colors duration-300"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-4 bg-black text-lg font-bold rounded-lg text-white hover:bg-gray-900 transition-all duration-300"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection; 