
import React, { useState } from 'react';
import { Menu, X, Zap, Users, Mail, Phone, MapPin, Eye, Target, Rocket, Star, ArrowRight, User, Lock } from 'lucide-react';


const Home = ({ setCurrentPage }) => {
  const stats = [
    { number: '500+', label: 'Campaigns Launched' },
    { number: '250+', label: 'Happy Clients' },
    { number: '98%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' }
  ];

  const services = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Brand Strategy',
      description: 'Crafting compelling brand narratives that resonate with your audience and drive engagement.'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Digital Campaigns',
      description: 'Data-driven campaigns across all platforms that deliver measurable results and ROI.'
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Growth Marketing',
      description: 'Accelerate your business growth with innovative marketing strategies and automation.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Floating orbs with better visibility */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/40 rounded-full blur-lg animate-pulse shadow-lg shadow-purple-500/20"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/40 rounded-full blur-lg animate-pulse shadow-lg shadow-pink-500/20" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-500/30 rounded-full blur-lg animate-pulse shadow-lg shadow-blue-500/20" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-60 right-1/3 w-20 h-20 bg-purple-400/50 rounded-full blur-md animate-pulse shadow-lg shadow-purple-400/20" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-28 h-28 bg-cyan-500/35 rounded-full blur-lg animate-pulse shadow-lg shadow-cyan-500/20" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-32 left-1/3 w-16 h-16 bg-pink-400/45 rounded-full blur-md animate-pulse shadow-lg shadow-pink-400/20" style={{animationDelay: '0.8s'}}></div>
          
          {/* Moving gradient shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/15 to-pink-600/15 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-600/15 to-purple-600/15 rounded-full blur-3xl animate-float-reverse"></div>
          </div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/8 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                Collabs that spark,<br />campaigns that stick.
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 italic">
                Where influence meets innovation.
              </p>
            </div>
            
            <div className="mb-12">
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                We create powerful marketing campaigns that not only capture attention but create lasting impact. 
                Our innovative approach combines creative storytelling with data-driven strategies to deliver 
                results that exceed expectations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setCurrentPage('contact')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center group"
              >
                Start Your Campaign
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-gray-600 text-gray-300 px-8 py-4 rounded-lg hover:border-gray-500 hover:text-white transition-all duration-300">
                View Our Work
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
                <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-purple-400 mb-3">
                    {stat.number}
                </div>
                <div className="text-lg md:text-xl text-gray-400">
                    {stat.label}
                </div>
                </div>
            ))}
            </div>
        </div>
        </section>


      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We offer comprehensive marketing solutions designed to elevate your brand and drive measurable growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-800/50 p-8 rounded-xl hover:bg-gray-800/70 transition-all duration-300 group cursor-pointer">
                <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-purple-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Let's collaborate and create campaigns that not only spark interest but create lasting impact for your brand.
          </p>
          <button 
            onClick={() => setCurrentPage('contact')}
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 group"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(20px) translateX(-10px); }
          50% { transform: translateY(10px) translateX(15px); }
          75% { transform: translateY(25px) translateX(-5px); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;