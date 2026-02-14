import { useState, useEffect } from 'react';
import SafarLink_Logo from '../assets/images/SafariLink_Logo.jpg'

const HOME=()=>{
 const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=600&fit=crop',
      title: 'Modern Travel',
      subtitle: 'Smart, fast, and seamless journeys'
    },
    {
      image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1920&h=600&fit=crop',
      title: 'Digital Innovation',
      subtitle: 'Book smarter, travel better'
    },
    {
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=600&fit=crop',
      title: 'Connected World',
      subtitle: 'Your gateway to endless destinations'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const changeSlide = (direction: number) => {
  setCurrentSlide((prev) => {
    const newSlide = prev + direction;
    if (newSlide >= 3) return 0;
    if (newSlide < 0) return 2;
    return newSlide;
  });
};


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar - Transparent & Blurred */}
      <nav className="fixed backdrop-blur-md bg-white/90 border-b border-white/20 top-0 left-0 right-0 z-40 transition-all">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={SafarLink_Logo} alt="" className='w-15 h-12 rounded-2xl'/>
              <span className="text-3xl font-bold text-sky-600">SafarLink</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-800 hover:text-sky-600 font-medium transition">Home</a>
              <a href="#" className="text-gray-800 hover:text-sky-600 font-medium transition">Bus</a>
              <a href="#" className="text-gray-800 hover:text-sky-600 font-medium transition">Train</a>
              <a href="#" className="text-gray-800 hover:text-sky-600 font-medium transition">My Bookings</a>
              <a href="#" className="text-gray-800 hover:text-sky-600 font-medium transition">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sky-600 font-medium hover:text-sky-800 transition">Login</button>
              <button className="px-6 py-2 bg-sky-600 text-white rounded-full font-medium hover:bg-sky-700 transition shadow-lg">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden mt-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-800 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-600/90 to-cyan-600/85 flex items-center justify-center">
                <div className="text-center text-white px-6">
                  <h1 className="text-5xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Controls */}
        <button
          onClick={() => changeSlide(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          onClick={() => changeSlide(1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Search Box */}
      <div className="container mx-auto px-6 -mt-24 relative z-30">
        <div className="backdrop-blur-md bg-white/95 rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button className="flex-1 py-3 bg-sky-600 text-white rounded-lg font-semibold shadow-md">Bus</button>
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Train</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input type="text" placeholder="Enter city" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input type="text" placeholder="Enter city" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent" />
            </div>
            <div className="flex items-end">
              <button className="w-full py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-md transition hover:scale-105">Search</button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Next-Gen Travel Platform</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">Technology meets convenience</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-sky-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Mobile First</h3>
            <p className="text-gray-600">Book on-the-go with our intuitive mobile app. Your tickets, always accessible.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-cyan-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Real-Time Updates</h3>
            <p className="text-gray-600">Live tracking, instant notifications, and up-to-date schedule information.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 transition hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">Blazing-fast booking experience with our optimized platform technology.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HOME;