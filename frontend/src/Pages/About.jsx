import React from "react";

import {
  
  Target,
  Zap,
  Heart,
  Globe,
  ShieldCheck,
  
  Award,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const teamMembers = [
  {
    name: "Hrishikesh Dhuri",
    role: "Founder & CEO",
    image: "/team/emily.jpg",
    bio: "10+ years in brand strategy with a passion for storytelling that converts."
  },
  {
    name: "Aryav Jain",
    role: "Head of Marketing",
    image: "/team/raj.jpg",
    bio: "Data-driven marketer who turns insights into growth opportunities."
  },
  {
    name: "Meet Kadam",
    role: "Creative Director",
    image: "/team/sophia.jpg",
    bio: "Visual storyteller creating campaigns that capture hearts and minds."
  },
  {
    name: "Prem Bhandugare",
    role: "Lead Developer",
    image: "/team/liam.jpg",
    bio: "Tech innovator building the digital experiences of tomorrow."
  },
];

const achievements = [
  { number: "150+", label: "Brands Transformed", icon: <Award className="w-6 h-6" /> },
  { number: "5M+", label: "People Reached", icon: <Globe className="w-6 h-6" /> },
  { number: "300%", label: "Avg ROI Increase", icon: <TrendingUp className="w-6 h-6" /> },
  { number: "3", label: "Years Excellence", icon: <Clock className="w-6 h-6" /> },
];

const journey = [
  {
    year: "2021",
    title: "The Beginning",
    description: "Founded with a vision to revolutionize digital marketing through authentic storytelling and data-driven creativity."
  },
  {
    year: "2022",
    title: "Rapid Growth",
    description: "Expanded our team and launched 100+ successful campaigns across diverse industries, from startups to Fortune 500."
  },
  {
    year: "2023",
    title: "Innovation Focus",
    description: "Pioneered AI-driven campaign optimization and interactive content strategies that set new industry standards."
  },
  {
    year: "2024",
    title: "Global Impact",
    description: "Reached international markets, helping brands connect with audiences across 25+ countries worldwide."
  },
];

const About = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto italic mb-8">
            Passionate marketers and creators, united to transform brands with innovative campaigns and lasting impact.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We're not just another marketing agency. We're brand architects, story weavers, and growth catalysts who believe every brand has a unique story worth telling.
          </p>
        </div>

        {/* Background shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/40 rounded-full blur-lg animate-pulse shadow-lg shadow-purple-500/20"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/40 rounded-full blur-lg animate-pulse shadow-lg shadow-pink-500/20"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-500/30 rounded-full blur-lg animate-pulse shadow-lg shadow-blue-500/20"></div>
          <div className="absolute top-60 right-1/3 w-20 h-20 bg-purple-400/50 rounded-full blur-md animate-pulse shadow-lg shadow-purple-400/20"></div>
          <div className="absolute bottom-20 left-1/2 w-28 h-28 bg-cyan-500/35 rounded-full blur-lg animate-pulse shadow-lg shadow-cyan-500/20"></div>
          <div className="absolute top-32 left-1/3 w-16 h-16 bg-pink-400/45 rounded-full blur-md animate-pulse shadow-lg shadow-pink-400/20"></div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Impact</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="text-center group">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300">
                  <div className="text-purple-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                    {achievement.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-400">{achievement.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 text-gray-300">
        <div className="bg-gray-800/30 p-8 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-purple-400 mr-3" />
            <h2 className="text-4xl font-bold text-purple-400">Our Mission</h2>
          </div>
          <p className="text-lg leading-relaxed">
            To empower brands with innovative marketing strategies that drive meaningful engagement, growth, and loyalty by merging creativity with data-driven insights.
          </p>
        </div>
        <div className="bg-gray-800/30 p-8 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
          <div className="flex items-center mb-4">
            <Star className="w-8 h-8 text-pink-400 mr-3" />
            <h2 className="text-4xl font-bold text-pink-400">Our Vision</h2>
          </div>
          <p className="text-lg leading-relaxed">
            To be the leading marketing partner for brands worldwide, recognized for transformative campaigns, unmatched creativity, and exceptional results.
          </p>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Journey</span>
        </h2>
        <div className="space-y-8">
          {journey.map((milestone, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-6 group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform">
                  {milestone.year}
                </div>
              </div>
              <div className="bg-gray-800/30 p-6 rounded-xl flex-1 hover:bg-gray-800/50 transition-all duration-300">
                <h3 className="text-2xl font-semibold text-purple-400 mb-3">{milestone.title}</h3>
                <p className="text-gray-300 leading-relaxed">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center text-purple-400">
          Meet the Team
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Our diverse team of creative minds and strategic thinkers brings together decades of experience in marketing, design, technology, and business growth.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-xl p-6 text-center hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-2 border-pink-400 group-hover:border-purple-400 transition-colors"
              />
              <h3 className="text-xl font-semibold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-pink-300 mb-3">{member.role}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center text-gray-300">
        <h2 className="text-4xl font-bold mb-4 text-purple-400">Our Core Values</h2>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          These principles guide every decision we make and every campaign we create.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <Zap className="w-12 h-12 text-pink-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Innovation</h3>
            <p className="leading-relaxed">We embrace creativity and forward-thinking solutions that push boundaries and set new standards.</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <Heart className="w-12 h-12 text-pink-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Passion</h3>
            <p className="leading-relaxed">We pour our hearts into every project, treating each brand as if it were our own.</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <ShieldCheck className="w-12 h-12 text-pink-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Integrity</h3>
            <p className="leading-relaxed">We believe in honest communication, ethical practices, and always doing what's right for our clients.</p>
          </div>
          <div className="bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <Globe className="w-12 h-12 text-pink-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-3 text-white">Global Impact</h3>
            <p className="leading-relaxed">We strive to make a positive difference not just locally, but globally, by amplifying voices that matter.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
