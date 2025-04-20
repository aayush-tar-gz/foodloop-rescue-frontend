import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h1 className="mb-6">Reduce Food Waste, Feed Communities</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-700">
            FoodLoop connects retailers with surplus food to NGOs that can distribute it to those in need, creating a sustainable cycle that reduces waste and fights hunger.
          </p>
          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-8">Join FoodLoop</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Only show if not authenticated */}
      {!isAuthenticated() && (
        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Retailers */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-primary/20 p-4 rounded-full mb-4">
                  <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Retailers</h3>
                <p className="text-gray-600 mb-4">List surplus food items on our platform to reduce waste and help communities.</p>
                <Link to="/signup" className="text-primary font-medium hover:underline mt-auto">Join as Retailer</Link>
              </div>
              
              {/* NGOs */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-secondary/20 p-4 rounded-full mb-4">
                  <svg className="w-10 h-10 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">NGOs</h3>
                <p className="text-gray-600 mb-4">Request available food from nearby retailers and distribute it to those in need.</p>
                <Link to="/signup" className="text-primary font-medium hover:underline mt-auto">Join as NGO</Link>
              </div>
              
              {/* Farmers */}
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="bg-accent/20 p-4 rounded-full mb-4">
                  <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 6a2 2 0 100 4 2 2 0 000-4zM13.71 10A2 2 0 1017 10a2 2 0 00-3.29 0zm-7.42 4a2 2 0 100 4 2 2 0 000-4zm7.42 0a2 2 0 100 4 2 2 0 000-4z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Farmers</h3>
                <p className="text-gray-600 mb-4">Connect with retailers to provide fresh produce and reduce post-harvest losses.</p>
                <Link to="/signup" className="text-primary font-medium hover:underline mt-auto">Join as Farmer</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-center mb-12">Our Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <p className="text-gray-700">Food items rescued</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">50+</div>
              <p className="text-gray-700">Active partnerships</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">5,000+</div>
              <p className="text-gray-700">People served</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if not authenticated */}
      {!isAuthenticated() && (
        <section className="py-16 bg-primary/5 mt-auto">
          <div className="container mx-auto text-center">
            <h2 className="mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-gray-700">
              Join FoodLoop today and be part of the solution to reduce food waste and food insecurity in your community.
            </p>
            <Link to="/signup">
              <Button size="lg" className="px-10">Get Started</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
