import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Users, MessageCircle, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              Mixing Bro Science with Real Science
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              That's the whole point. Because bro science is the anecdotal part.
            </p>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-12 text-left max-w-3xl mx-auto">
              <p className="text-lg mb-4">
                <span className="text-[#229DD8] font-semibold">I always separate what I believe from what I can prove.</span>
              </p>
              <p className="text-slate-300 mb-4">
                52+ compounds reviewed, 1 million+ YouTube views, 200+ consultations.
                Every claim receipted, every protocol questioned. Every side effect documented.
                <br />
                <span className="text-[#229DD8] font-medium">Dive into the verifiable data and discussions as a member.</span>
              </p>
              <p className="text-lg">
                <span className="text-[#229DD8] font-semibold">I'm not here to teach. I'm here to help.</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/register" 
                className="bg-[#229DD8] hover:bg-[#1a7db0] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Get Full Access
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/login" 
                className="border border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Login
              </Link>
              <Link 
                to="/library" 
                className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Browse Library
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Question Permission Section */}
      <div className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#229DD8]">
            There are no stupid questions
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Only questions you should have asked but didn't because you thought they were stupid.
          </p>
          <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Confused about your bloodwork?</h3>
            <p className="text-slate-300 mb-4">
              Post it. This is how we can verify what's happening instead of relying on subjective experience alone and going with math.
            </p>
            <Link 
              to="/register" 
              className="bg-[#229DD8] hover:bg-[#1a7db0] text-white px-6 py-3 rounded font-semibold transition-colors inline-flex items-center"
            >
              Join Forum
              <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">What You Get</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Non-members get a taste. Members get the full breakdown.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <FileText className="w-8 h-8 text-[#229DD8] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Compound Library</h3>
              <p className="text-slate-400 mb-3">
                Detailed breakdowns with sources, dosing, and real experience data.
              </p>
              <div className="text-sm text-slate-500 bg-slate-700 p-3 rounded">
                <p className="font-semibold text-white mb-2">Sneak Peek:</p>
                <ul className="list-disc pl-4 mb-2">
                  <li>Compound Alpha: Overview &amp; Basic Info</li>
                  <li className="text-slate-600 italic">...many more details (Members Only)</li>
                </ul>
                <Link to="/register" className="text-[#229DD8] hover:underline text-sm inline-flex items-center">
                  Get Full Access <ChevronRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <Users className="w-8 h-8 text-[#229DD8] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-slate-400 mb-3">
                Direct access to discussions without the noise.
              </p>
              <div className="text-sm text-slate-500 bg-slate-700 p-3 rounded">
                <p className="font-semibold text-white mb-2">Sample Post:</p>
                <p className="truncate mb-2">"Understanding TRT protocols and bloodwork..."</p>
                <Link to="/register" className="text-[#229DD8] hover:underline text-sm inline-flex items-center">
                  Join the Discussion <ChevronRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <MessageCircle className="w-8 h-8 text-[#229DD8] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Bloodwork Analysis</h3>
              <p className="text-slate-400 mb-3">
                Math-based verification instead of guesswork.
              </p>
              <div className="text-sm text-slate-500 bg-slate-700 p-3 rounded">
                <p className="font-semibold text-white mb-2">Example:</p>
                <p className="mb-2">Testosterone: [Value] (Detailed interpretation for members)</p>
                <Link to="/register" className="text-[#229DD8] hover:underline text-sm inline-flex items-center">
                  Analyze Yours <ChevronRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <TrendingUp className="w-8 h-8 text-[#229DD8] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Protocol Tracking</h3>
              <p className="text-slate-400 mb-3">
                Document what works and what doesn't with real data.
              </p>
              <div className="text-sm text-slate-500 bg-slate-700 p-3 rounded">
                <p className="font-semibold text-white mb-2">Preview:</p>
                <p className="mb-2">Basic tracking template. (Advanced tools for members)</p>
                <Link to="/register" className="text-[#229DD8] hover:underline text-sm inline-flex items-center">
                  Start Tracking <ChevronRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to separate belief from proof?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join the forum where anecdotal meets analytical.
          </p>
          <Link 
            to="/register" 
            className="bg-[#229DD8] hover:bg-[#1a7db0] text-white px-10 py-4 rounded-lg font-bold text-xl transition-colors inline-flex items-center"
          >
            Get Started
            <ChevronRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
